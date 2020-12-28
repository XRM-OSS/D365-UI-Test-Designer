import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { Modal, IDragOptions } from "@fluentui/react/lib/Modal";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { ContextualMenu } from "@fluentui/react/lib/ContextualMenu";
import { mergeStyleSets, getTheme, FontWeights } from "@fluentui/react/lib/Styling";
import { TestSuite } from "../domain/TestSuite";
import { setStoredPageState, setStoredTestSuite, defaultPageState, defaultTestSuite, getStoredTestSuite } from "../domain/Storage";

interface ErrorBoundaryState {
    error?: Error;
    suite?: TestSuite;
}

interface ErrorBoundaryProps {

}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);

    this.state = {
        error: undefined 
    };
  }

  async componentDidMount() {
    const suite = await getStoredTestSuite();
    this.setState({ suite });
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    console.error(error);
  }

  resetError = async () => {
      await setStoredPageState(defaultPageState);
      await setStoredTestSuite(defaultTestSuite);

      this.setState({ error: undefined });
  }

  render() {
    const titleid = "d365_uitest_designer_errorboundary";

    const theme = getTheme();
    const contentStyles = mergeStyleSets({
        container: {
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'stretch',
        },
        header: [
          // eslint-disable-next-line deprecation/deprecation
          theme.fonts.xLargePlus,
          {
            flex: '1 1 auto',
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
          },
        ],
        body: {
          flex: '4 4 auto',
          padding: '0 24px 24px 24px',
          overflowY: 'hidden',
          selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
          },
        },
      });

    if (this.state.error) {
        return (
            <Modal
                titleAriaId={titleid}
                isOpen={true}
                onDismiss={this.resetError}
                isBlocking={true}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <span id={titleid}>An error occured</span>
                </div>
                <div className={contentStyles.body}>
                    <p>There was probably a problem with rendering your test definition. Please open an issue on our GitHub repo and provide below information (The test suite data contains your test definition including values that will be set, please remove any sensitive information) <a href="https://github.com/XRM-OSS/D365-UI-Test-Designer/issues">here</a></p>
                    <p>{this.state.error.message}</p>
                    <p>{this.state.error.stack}</p>
                    <p>You might want to back this up. Resetting will delete it: {JSON.stringify(this.state.suite)}</p>
                    <DefaultButton onClick={this.resetError}>Reset test suite</DefaultButton>
                </div>
            </Modal>
        );
    }

    return this.props.children;
  }
}