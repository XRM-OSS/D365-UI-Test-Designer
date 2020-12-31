import * as React from "react";
import { EntityMetadata, TestAction, TestAssertion, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { Pivot, PivotItem } from "@fluentui/react/lib/Pivot";
import { TextField } from "@fluentui/react/lib/TextField";
import { Button, DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { setStoredTestSuite } from "../domain/Storage";

export interface ExportViewProps {
    state: TestSuite;
    importTestSuite: (suite: TestSuite) => void;
}

const generateVisibilityExpression = (e: TestAssertion, metadata: EntityMetadata) => {
    const control = metadata?.controls?.find(c => c.controlName === e.name);

    switch (control?.type) {
        case "control":
            return `expect((await xrmTest.Control.get("${e.name}")).isVisible).toBe(${e.assertions.expectedVisibility.type === "visible"});`;
        case "tab":
            return `expect((await xrmTest.Tab.get("${e.name}")).isVisible).toBe(${e.assertions.expectedVisibility.type === "visible"});`;
        case "section":
            return `expect((await xrmTest.Section.get("${control.tabName}", "${e.name}")).isVisible).toBe(${e.assertions.expectedVisibility.type === "visible"});`;
        default:
            return `expect((await xrmTest.Control.get("${e.name}")).isVisible).toBe(${e.assertions.expectedVisibility.type === "visible"});`;
    }
}

const stringifyValue = (attributeType: Xrm.Attributes.AttributeType, value: any) => {
    const stringEscaper = (value: any) => value != null ? `"${value.toString()?.replace(/"/g, '\\"')}"` : "null";
    const defaultStringifier = (value: any) => value != null ? value.toString() : "null";

    switch (attributeType) {
        case "boolean":
            return defaultStringifier(value);
        case "datetime":
            return stringEscaper(value);
        case "decimal":
            return defaultStringifier(value);
        case "double":
            return defaultStringifier(value);
        case "integer":
            return defaultStringifier(value);
        case "lookup":
            // Is already handled as string everywhere
            return value;
        case "memo":
            return stringEscaper(value);
        case "money":
            return defaultStringifier(value);
        case "multiselectoptionset":
            return defaultStringifier(value);
        case "optionset":
            return defaultStringifier(value);
        case "string":
            return stringEscaper(value);
        default:
            return defaultStringifier(value);
    }
}

const generateExpression = (e: TestAction, metadata: EntityMetadata) => {
    switch(e.event) {
        case "setValue":
            return [`await xrmTest.Attribute.setValue("${e.name}", ${stringifyValue(e.attributeType, e.value)});`];
        case "save":
            return [`await xrmTest.Entity.save();`];
        case "timeout":
            return [`await page.waitForTimeout(${e.duration});`];
        case "assertion":
            return [
                (e.assertions.expectedVisibility?.active && e.assertions.expectedVisibility?.type !== "noop")
                    ? generateVisibilityExpression(e, metadata)
                    : undefined,
                (e.assertions.expectedDisableState?.active && e.assertions.expectedDisableState?.type !== "noop")
                    ? `expect((await xrmTest.Control.get("${e.name}")).isDisabled).toBe(${e.assertions.expectedDisableState.type === "disabled"});`
                    : undefined,
                (e.assertions.expectedFieldLevel?.active && e.assertions.expectedFieldLevel?.type !== "noop")
                    ? `expect((await xrmTest.Attribute.getRequiredLevel("${e.attributeName}"))).toBe("${e.assertions.expectedFieldLevel.type}");`
                    : undefined,
                (e.assertions.expectedValue?.active && e.assertions.expectedValue?.type === "value")
                    ? `expect((await xrmTest.Attribute.getValue("${e.attributeName}"))).toStrictEqual(${stringifyValue(e.attributeType, e.assertions.expectedValue.value)});`
                    : undefined,
                (e.assertions.expectedValue?.active && e.assertions.expectedValue?.type === "null")
                    ? `expect((await xrmTest.Attribute.getValue("${e.attributeName}"))).toBeNull();`
                    : undefined,
                (e.assertions.expectedValue?.active && e.assertions.expectedValue?.type === "notnull")
                ? `expect((await xrmTest.Attribute.getValue("${e.attributeName}"))).not.toBeNull();`
                    : undefined,
            ];
        default:
            return [""];
    }
}

export const ExportView: React.FC<ExportViewProps> = ({state, importTestSuite}) => {
    const [importText, setImportText] = React.useState("");

    const triggerImport = () => {
        try {
            importTestSuite(JSON.parse(importText));
            setImportText("");
        }
        catch(e) {

        }
    }

    const exportValue = `
    import { XrmUiTest } from "d365-ui-test";
    import * as fs from "fs";
    import * as playwright from "playwright";
    import * as path from "path";
    
    const xrmTest = new XrmUiTest();
    let browser: playwright.Browser = null;
    let context: playwright.BrowserContext = null;
    let page: playwright.Page = null;
    
    describe("Basic operations UCI", () => {
        beforeAll(async() => {
            jest.setTimeout(60000);
    
            await xrmTest.launch("chromium", {
                headless: !!process.env.D365_UI_TEST_HEADLESS,
                args: [
                    '--disable-setuid-sandbox',
                    '--disable-infobars',
                    '--start-fullscreen',
                    '--window-position=0,0',
                    '--window-size=1920,1080',
                    '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"'
                ]
            })
            .then(([b, c, p]) => {
                browser = b;
                context = c;
                page = p;
            });
        });
    
        test("Start D365", async () => {
            const settingsPath = path.join(__dirname, "../../settings.txt");
            const settingsFound = fs.existsSync(settingsPath);
            const config = settingsFound ? fs.readFileSync(settingsPath, {encoding: 'utf-8'}) : ${'`${process.env.D365_UI_TEST_URL ?? process.env.CRM_URL ?? ""},${process.env.D365_UI_TEST_USERNAME ?? process.env.USER_NAME ?? ""},${process.env.D365_UI_TEST_PASSWORD ?? process.env.USER_PASSWORD ?? ""},${process.env.D365_UI_TEST_MFA_SECRET ?? process.env.MFA_SECRET ?? ""}`'};
            const [url, user, password, mfaSecret] = config.split(",");
    
            await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
        });
        
${state.tests.filter(t => !!t).map(t => {
    return [
        `test("${t.name}", async () => {`,
        t.preTestNavigation ? (t.preTestNavigation.recordId ? `await xrmTest.Navigation.openUpdateForm("${t.preTestNavigation.entity}", "${t.preTestNavigation.recordId}")` : `await xrmTest.Navigation.openCreateForm("${t.preTestNavigation.entity}");`) : undefined,
        ...(t.actions || [])
            .reduce((all, cur) => [...all, ...generateExpression(cur, state.metadata[t.entityLogicalName])], []),
        "});"
    ].filter(l => !!l).map((l, i) => `${(i === 0 || l === "});") ? "\t" : "\t\t"}${l}`).join("\n");
}).join("\n\n")}
    
        afterAll(() => {
            return xrmTest.close();
        });
    });
    
    /** Do not delete, below JSON is your test definition for reimport to D365-UI-Test-Designer
    ${JSON.stringify(state)}
    */
    `;

    return (
        <Pivot aria-label="Import/Export">
            <PivotItem
                headerText="Export"
                headerButtonProps={{
                    "data-order": 1,
                    "data-title": "Export",
                }}
            >
                <TextField rows={25} multiline readOnly value={exportValue} />
            </PivotItem>
            <PivotItem headerText="Import">
                <TextField rows={25} style={{width: "100%", height: "100%"}} onChange={(e, v) => setImportText(v)} multiline value={importText} />
                <PrimaryButton label="Import" onClick={triggerImport}>Import</PrimaryButton>
            </PivotItem>
      </Pivot>
    );
}