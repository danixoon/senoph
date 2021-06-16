import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent } from "icons/arrowDown.svg";
import Header from "components/Header";
import Button, { ButtonProps } from "components/Button";

export type SpoilerProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    label: string;
  }
>;

const Spoiler: React.FC<SpoilerProps> = (props) => {
  const { label, children, ...rest } = props;

  const [isOpened, toggleOpen] = React.useState(() => false);

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(`spoiler`, isOpened && "spoiler_opened"),
    },
    rest
  );

  const handleToggleOpen = () => {
    toggleOpen(!isOpened);
  };

  return (
    <div {...mergedProps}>
      <Button tabIndex={0} onClick={handleToggleOpen} color="invisible">
        <Header className="spoiler__label">{label}</Header>
      </Button>
      <div className="spoiler__container">{children}</div>
    </div>
  );
};

export default Spoiler;
