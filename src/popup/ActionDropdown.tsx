import { Checkbox } from "@fluentui/react/lib/Checkbox";
import { Dropdown, IDropdownOption } from "@fluentui/react/lib/Dropdown";
import { Text } from "@fluentui/react/lib/Text";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";
import * as React from "react";

export interface ActionDropdownProps {
    checked: boolean,
    onCheckedChange: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => void,
    label: string,
    onDropdownChange: (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => void,
    dropdownSelectedKey: string,
    options: Array<IDropdownOption>
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
    checked,
    onCheckedChange,
    label,
    onDropdownChange,
    dropdownSelectedKey,
    options,
    children
}) => {
    const classNames = mergeStyleSets({
        eventText: {
          fontWeight: 'bold',
        }
    });

    return (
        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
            <Checkbox checked={checked} onChange={onCheckedChange} />
            <div style={{display: "flex", flex: "1", flexDirection: "row", width: "100%"}}>
                <Text styles={{root: { paddingTop: "10px"}}} className={classNames.eventText}>{label}</Text>
                <Dropdown
                    onChange={onDropdownChange}
                    selectedKey={dropdownSelectedKey}
                    styles={{ root: { paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px", flex: "1"}}}
                    options={options}
                />
                { children }
            </div>
        </div>
    );
}