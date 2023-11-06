import Input, { InputProps } from "./Input";

export const CONTROL_TYPE = {
  INPUT: "input",
} as const;

type ControlProps = {
  control: typeof CONTROL_TYPE.INPUT;
} & InputProps;

const Control = (props: ControlProps) => {
  const { control, ...rest } = props;
  switch (control) {
    case CONTROL_TYPE.INPUT:
      return <Input {...(rest as InputProps)} />;
    default:
      return null;
  }
};

export default Control;
