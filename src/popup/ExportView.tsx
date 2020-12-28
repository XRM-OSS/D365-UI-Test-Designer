import * as React from "react";
import { TestAction, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { Pivot, PivotItem } from "@fluentui/react/lib/Pivot";
import { TextField } from "@fluentui/react/lib/TextField";
import { Button, DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { setStoredTestSuite } from "../domain/Storage";

export interface ExportViewProps {
    state: TestSuite
}

const generateExpression = (e: TestAction) => {
    switch(e.event) {
        case "setValue":
            return [`await xrmTest.Attribute.setValue("${e.name}", ${typeof(e.value) === "string" && e.attributeType !== "lookup" ? `"${e.value.replace(/"/g, '\\"')}"` : e.value});`];
        case "save":
            return [`await xrmTest.Entity.save();`];
        case "timeout":
            return [`await page.waitForTimeout(${e.duration});`];
        case "assertion":
            return [
                (e.assertions.expectedVisibility?.active && e.assertions.expectedVisibility?.type !== "noop")
                    ? `expect((await xrmTest.Control.get("${e.name}")).isVisible).toBe(${e.assertions.expectedVisibility.type === "visible"});`
                    : undefined,
                (e.assertions.expectedDisableState?.active && e.assertions.expectedDisableState?.type !== "noop")
                    ? `expect((await xrmTest.Control.get("${e.name}")).isDisabled).toBe(${e.assertions.expectedDisableState.type === "disabled"});`
                    : undefined,
                (e.assertions.expectedFieldLevel?.active && e.assertions.expectedFieldLevel?.type !== "noop")
                    ? `expect((await xrmTest.Attribute.getRequiredLevel("${e.attributeName}"))).toBe("${e.assertions.expectedFieldLevel.type}");`
                    : undefined,
                (e.assertions.expectedValue?.active && e.assertions.expectedValue?.type === "value")
                    ? `expect((await xrmTest.Attribute.getValue("${e.attributeName}"))).toStrictEqual(${typeof(e.assertions.expectedValue.value) === "string" && e.attributeType !== "lookup" ? `"${e.assertions.expectedValue.value.replace(/"/g, '\\"')}"` : e.assertions.expectedValue.value});`
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

export const ExportView: React.FC<ExportViewProps> = ({state}) => {
    const [importText, setImportText] = React.useState("");

    const importTest = async (json: string) => {
        await setStoredTestSuite(JSON.parse(json));
        setImportText("");
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
                headless: false,
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
            const config = fs.readFileSync(path.join(__dirname, "../../settings.txt"), {encoding: 'utf-8'});
            const [url, user, password, mfaSecret] = config.split(",");
    
            await xrmTest.open(url, { userName: user, password: password, mfaSecret: mfaSecret ?? undefined });
        });
        
${state.tests.filter(t => !!t).map(t => {
    return [
        `test("${t.name}", async () => {`,
        t.preTestNavigation ? (t.preTestNavigation.recordId ? `await xrmTest.Navigation.openUpdateForm("${t.preTestNavigation.entity}", "${t.preTestNavigation.recordId}")` : `await xrmTest.Navigation.openCreateForm("${t.preTestNavigation.entity}");`) : undefined,
        ...(t.actions || [])
            .reduce((all, cur) => [...all, ...generateExpression(cur)], []),
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
                <TextField rows={30} multiline value={exportValue} />
            </PivotItem>
            <PivotItem headerText="Import">
                <TextField rows={30} style={{width: "100%", height: "100%"}} onChange={(e, v) => setImportText(v)} multiline value={importText} />
                <PrimaryButton label="Import" onClick={() => importTest(importText)}>Import</PrimaryButton>
            </PivotItem>
      </Pivot>
    );
}