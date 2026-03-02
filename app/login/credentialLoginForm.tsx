"use client";
import {
  Button,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import React, { useActionState } from "react";
import { authenticate } from "../lib/auth-actions";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function CredentialForm() {
  const [state, formAction, isPending] = useActionState(authenticate, {
    success: false,
    message: "",
    fields: {},
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-5">
        <TextField
          fullWidth
          sx={{
            "& input:-webkit-autofill": {
              WebkitBoxShadow: "0 0 0 1000px white inset",
              WebkitTextFillColor: "#000",
            },
          }}
          type="email"
          name="email"
          label="メールアドレス"
          required
          defaultValue={state.fields?.email}
        />
        <FormControl fullWidth variant="outlined" required>
          <InputLabel htmlFor="password">パスワード</InputLabel>
          <OutlinedInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            sx={{
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px white inset",
                WebkitTextFillColor: "#000",
              },
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? "hide the password" : "display the password"
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="パスワード"
          />
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isPending}
        >
          メールアドレスでログイン
        </Button>
      </div>
      {state?.message && (
        <p
          className="text-red-500
      "
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
