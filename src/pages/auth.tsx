import { LoadingButton, TextButton } from "@/components/button";
import { TextField, Typography } from "@mui/material";
import Head from "next/head";
import { FormEventHandler, useState } from "react";
import styles from "@/styles/auth.module.css";
import { api } from "@/utils/api";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { ClientToken } from "@/utils/client_token";
import { type NextRouter, useRouter } from "next/router";
import { alphaNumericString } from "@/utils/zod";
import { TRPCClientError } from "@trpc/client";
import { UserStore } from "@/utils/global-store";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();
  const saveUserData = (data: { name: string; display_picture: string | undefined }) => {
    UserStore.set("user", data);
  };

  return isLogin ? (
    <Login router={router} toggle={() => setIsLogin(false)} saveUserData={saveUserData} />
  ) : (
    <Signup router={router} toggle={() => setIsLogin(true)} saveUserData={saveUserData} />
  );
}

interface AuthComponentProps {
  router: NextRouter;
  toggle: () => void;
  saveUserData: (data: { name: string; display_picture: string | undefined }) => void;
}

function Signup(props: AuthComponentProps) {
  const [errorMsg, setErrorMsg] = useState("");
  const signupMut = api.auth.signup.useMutation({
    onSuccess: (data) => {
      setErrorMsg("");
      ClientToken.set(data.token);
      props.saveUserData({ name: data.name, display_picture: undefined });
      props.router.push(`/profile/${data.name}?reload=true`);
    },
    onError: (e) => {
      if (e instanceof TRPCClientError) {
        try {
          const err: { message: string } = JSON.parse(e.message)[0];
          setErrorMsg(err.message);
        } catch {
          setErrorMsg("Something went wrong!");
        }
        return;
      }
      setErrorMsg(e.message);
    },
  });

  const [input, setInput] = useState({ username: "", password: "" });
  const [warnAlphaNumeric, setWarnAlphaNumeric] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  api.auth.checkUsernameAvailable.useQuery(input.username, {
    cacheTime: 0,
    enabled: !!input.username && input.username.length >= 5 && input.username.length <= 25,
    onSuccess: (data) => setUsernameAvailable(data),
    onError: () => setUsernameAvailable(false),
  });

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    signupMut.mutate({
      name: input.username,
      password: input.password,
    });
  };

  return (
    <>
      <Head>
        <title>Sign Up | RateMySite</title>
      </Head>
      <main className={styles.main}>
        <div className="rms_logo" onClick={() => props.router.push("/")} />
        <h1>Sign Up</h1>
        <form className={styles.form} onSubmit={submit}>
          <Typography color="red" fontSize={12}>
            {errorMsg}
          </Typography>
          <TextField
            variant="filled"
            label="Username"
            name="username"
            value={input.username}
            required
            error={input.username.length ? !usernameAvailable : false}
            helperText={
              warnAlphaNumeric
                ? "Username must be alphaNumeric"
                : !!input.username.length &&
                  (input.username.length < 5
                    ? "Username is too short"
                    : input.username.length > 25
                    ? "Username is too long"
                    : !usernameAvailable
                    ? "Username is already taken"
                    : "")
            }
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              if (value.length > 0) {
                const check = alphaNumericString("Username").safeParse(value);
                if (!check.success) {
                  setWarnAlphaNumeric(true);
                  return;
                }
              }

              if (warnAlphaNumeric) setWarnAlphaNumeric(false);

              setInput((state) => ({ ...state, username: value }));
              if (e.target.value.length < 5 || e.target.value.length > 25) {
                setUsernameAvailable(false);
              }
            }}
            InputProps={{
              endAdornment: input.username.length ? (
                usernameAvailable ? (
                  <CheckCircleOutlineIcon color="success" />
                ) : (
                  <HighlightOffIcon color="error" />
                )
              ) : null,
            }}
          />
          <TextField
            variant="filled"
            label="Password"
            name="password"
            type="password"
            value={input.password}
            required
            error={input.password.length ? input.password.length < 8 : false}
            helperText={
              !!input.password.length && (input.password.length < 8 ? "Password is too short" : "")
            }
            onChange={(e) => setInput((state) => ({ ...state, password: e.target.value }))}
          />
          <LoadingButton
            type="submit"
            isLoading={signupMut.isLoading}
            disabled={
              signupMut.isLoading ||
              !input.username.length ||
              !usernameAvailable ||
              !input.password.length
            }
            isSuccess={signupMut.isSuccess}
            isError={signupMut.isSuccess}
          >
            Submit
          </LoadingButton>
        </form>
        <p>
          Already have an account? <TextButton onClick={props.toggle}>Log in.</TextButton>
        </p>
      </main>
    </>
  );
}

function Login(props: AuthComponentProps) {
  const [errorMsg, setErrorMsg] = useState("");
  const loginMut = api.auth.login.useMutation({
    onSuccess: (data) => {
      setErrorMsg("");
      ClientToken.set(data.token);
      props.saveUserData({ name: data.name, display_picture: data.display_picture });
      props.router.push(`/profile/${data.name}?reload=true`);
    },
    onError: (e) => {
      setErrorMsg(e.message);
    },
  });

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("username"),
      password: formData.get("password"),
    };

    if (!data.name || !data.password) return;

    loginMut.mutate({
      name: data.name.toString(),
      password: data.password.toString(),
    });
  };

  return (
    <>
      <Head>
        <title>Log In | RateMySite</title>
      </Head>
      <main className={styles.main}>
        <div className="rms_logo" onClick={() => props.router.push("/")} />
        <h1>Log In</h1>
        <form className={styles.form} onSubmit={submit}>
          <Typography color="red" fontSize={12}>
            {errorMsg}
          </Typography>
          <TextField variant="filled" label="Username" name="username" required />
          <TextField variant="filled" label="Password" name="password" type="password" required />
          <LoadingButton
            type="submit"
            isLoading={loginMut.isLoading}
            disabled={loginMut.isLoading}
            isSuccess={loginMut.isSuccess}
            isError={loginMut.isError}
          >
            Submit
          </LoadingButton>
        </form>
        <p>
          Don't have an account? <TextButton onClick={props.toggle}>Sign Up.</TextButton>
        </p>
      </main>
    </>
  );
}
