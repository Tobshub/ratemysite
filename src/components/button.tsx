import { Button, CircularProgress, SxProps } from "@mui/material";
import { PropsWithChildren } from "react";

interface ButtonProps {
  onClick?: () => void;
  sx?: SxProps;
  disabled?: boolean;
  type?: "submit";
  className?: string;
}

export const PrimaryButton = (props: ButtonProps & PropsWithChildren) => {
  return (
    <Button
      className={props.className}
      variant="contained"
      sx={props.sx}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
};

export const SuccessButton = (props: ButtonProps & PropsWithChildren) => {
  return (
    <Button
      className={props.className}
      variant="contained"
      color="success"
      sx={props.sx}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
};

export const TextButton = (props: ButtonProps & PropsWithChildren) => {
  return (
    <Button
      className={props.className}
      variant="text"
      sx={props.sx}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const LoadingButton = (
  props: LoadingButtonProps & ButtonProps & PropsWithChildren
) => {
  return (
    <Button
      className={props.className}
      variant={"contained"}
      color={props.isSuccess ? "success" : props.isError ? "error" : "info"}
      sx={props.sx}
      type={props.type}
      disabled={props.disabled}
      onClick={props.onClick}
      startIcon={props.isLoading ? <CircularProgress size={20} /> : null}
    >
      {props.children}
    </Button>
  );
};
