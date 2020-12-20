import * as React from "react";
import { Button, Form, Nav, Navbar, Table } from "react-bootstrap";
import { popUpState } from "../domain/popUpState";
import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";

export interface ExportViewProps {
    state: popUpState
}

export const ExportView: React.FC<ExportViewProps> = ({state}) => {
    const value = `
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
    
        test("Open new account form", async () => {
            await xrmTest.Navigation.openCreateForm("account");

            ${state.captures
                .filter(e => e.event === "setValue")
                .map(e => `await xrmTest.Attribute.setValue("${e.name}", ${typeof(e.value) === "string" && e.attributeType !== "lookup" ? `"${e.value}"` : e.value})`)
                .join("\n\t\t")
            }
        });
    
        afterAll(() => {
            return xrmTest.close();
        });
    });`

    return (
        <textarea style={{width: "100%", height: "100%"}} value={value} />
    );
}