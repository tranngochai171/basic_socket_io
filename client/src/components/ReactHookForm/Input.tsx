import { TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { ComponentProps } from "react";

export type InputProps = ComponentProps<typeof TextField> & {
  name: string;
  label: string;
};

const Input = (props: InputProps) => {
  const { name, label, ...rest } = props;
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { invalid, error },
        // formState,
      }) => {
        return (
          <TextField
            onBlur={onBlur} // notify when input is touched
            onChange={onChange} // send value to hook form
            value={value}
            label={label}
            error={!!invalid}
            helperText={error?.message}
            {...rest}
          />
        );
      }}
    />
  );
};

export default Input;
