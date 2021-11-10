import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent } from "icons/arrowDown.svg";
import Button from "components/Button";
import { FormContext } from "components/Form";
import Span from "components/Span";
import AltPopup from "components/AltPopup";
import { useIsFirstEffect } from "hooks/useIsFirstEffect";
import { useTimeout } from "hooks/useTimeout";

type DropdownItem = { id: any; label: string; payload?: any };

type DropdownProps = OverrideProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  {
    input: any;
    name: string;
    label?: string;
    items: DropdownItem[];
    onChange: (event: { target: { name: string; value: any } }) => void;
    required?: boolean;
  }
>;

const Dropdown: React.FC<DropdownProps> = (props) => {
  const { label, name, items, input, onChange, disabled, required, ...rest } =
    props;

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
  const formContext = React.useContext(FormContext);

  if (required)
    formContext.addCheck(input, name, (v) =>
      v == null ? "Значение обязательно" : false
    );

  // TODO: Make popup system reusable
  const [show, message, toggleMessage] = useTimeout<string | null>(null, 2000);

  const isFirst = useIsFirstEffect();

  React.useEffect(() => {
    // TODO: Make error context nullable
    if (isFirst) return;
    const msg = formContext.error[name]?.message;
    toggleMessage(msg);
  }, [formContext.error[name]]);

  React.useEffect(() => {
    if (isFirst) return;

    if (selectedItem.id === null) onChange({ target: { name, value: null } });
  }, [selectedItem.id]);

  return (
    <div {...mergedProps}>
      {label && (
        <Label weight="medium" className="drowpown__label">
          {label}
          {required ? (
            <Span inline color="primary">
              *
            </Span>
          ) : (
            ""
          )}
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
        <AltPopup
          target={show && message ? dropdownRef.current : null}
          position="bottom"
        >
          {message}
        </AltPopup>
      </div>
    </div>
  );
};

export default Dropdown;
