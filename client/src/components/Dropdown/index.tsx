import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent } from "icons/arrowDown.svg";
import Button from "components/Button";

type DropdownItem = { id: any; label: string; payload?: any };

type DropdownProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: any;
    name: string;
    label?: string;
    items: DropdownItem[];
    onChange: (event: { target: { name: string; value: any } }) => void;
  }
>;

const Dropdown: React.FC<DropdownProps> = (props) => {
  const { label, name, items, input, onChange, disabled, ...rest } = props;

  const [isOpened, toggleOpen] = React.useState(() => false);

  const emptyItem = {
    label: "Не выбрано",
    id: null,
    payload: {},
  };

  let listItems =
    input[name] !== undefined ? [emptyItem, ...items] : [...items];
  let selectedItem: ArrayElement<DropdownProps["items"]> =
    listItems.find((item, i) => {
      if (item.id == null || input[name] == null) return;
      if (item.id.toString() === input[name].toString()) {
        listItems.splice(i, 1);
        return true;
      }
    }) ?? emptyItem;

  const handleItemSelect = (item: DropdownItem) => {
    onChange({ target: { name: props.name, value: item.id } });
    toggleOpen(false);
  };

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        `dropdown`,
        isOpened && "dropdown_opened",
        disabled && "dropdown_disabled",
        label && "dropdown_labeled"
      ),
    },
    rest
  );

  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div {...mergedProps}>
      {label && (
        <Label weight="medium" className="drowpown__label">
          {label}
        </Label>
      )}
      <div
        ref={(r) => (dropdownRef.current = r)}
        className="dropdown__container"
        onFocus={(e) => {
          if (!disabled) toggleOpen(true);
        }}
        onBlur={(e) => {
          const currentTarget = e.currentTarget;
          setTimeout(() => {
            if (!currentTarget.contains(document.activeElement)) {
              toggleOpen(false);
            }
          }, 0);
        }}
      >
        <Button inverted className="dropdown-item" fill>
          <Label className="dropdown-item__label" unselectable>
            {selectedItem.label}
          </Label>
        </Button>
        {listItems.map((item, i) => (
          <Button
            key={item.id}
            fill
            inverted
            className="dropdown-item"
            onClick={() => handleItemSelect(item)}
          >
            <Label unselectable>{item.label}</Label>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
