import { ClientToken } from "@/utils/client_token";
import styles from "@/styles/create-post.module.css";
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SxProps,
  TextField,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useRouter } from "next/router";
import { LoadingButton } from "./button";
import { api } from "@/utils/api";
import { ChangeEventHandler, FormEventHandler, useRef, useState } from "react";
import { Cancel as CancelIcon, ImageSharp } from "@mui/icons-material";
import type { PostFlags } from "@/server/api/tdb";
import { PostFlagNames } from "./post-flags";

export default function CreatePost(props: {
  open: boolean;
  close: () => void;
}) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const postMut = api.post.new.useMutation({
    onSuccess: (_data) => {
      // TODO: some logic to add the post to the feed
      props.close();
    },
    onError: (e) => {
      setErrorMsg(e.message);
    },
  });

  const [postFlags, setPostFlags] = useState<string[]>([]);
  const [pictures, setPictures] = useState<string[]>([]);
  const reader = new FileReader();
  const pictureInputRef = useRef<HTMLInputElement>(null);

  const handlePictureInputChange: ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (!e.target.files || !e.target.files.length) {
      return;
    }

    // TODO: visually track upload progress
    for (const file of e.target.files) {
      reader.readAsDataURL(file);
      await new Promise<void>((res) => {
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === "string") {
            const file = e.target.result;
            setPictures((state) => [...state, file]);
          }
          res();
        };
      });
    }
  };

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      content: formData.get("content"),
    };

    if (!data.title || !data.content) {
      return;
    }

    postMut.mutate({
      title: data.title.toString(),
      content: data.content.toString(),
      pictures: pictures,
      flags: postFlags,
    });
  };

  if (!ClientToken.get()) {
    router.push("/auth");
  }

  return (
    <Dialog open={props.open} onClose={props.close}>
      <form onSubmit={submit} className={styles.form}>
        <Typography className={styles.form_child} variant="h6">
          Create Post
        </Typography>
        <Typography className={styles.form_child} fontSize={12} color="red">
          {errorMsg}
        </Typography>
        <TextField
          className={styles.form_child}
          variant="filled"
          label="Title"
          name="title"
          required
        />
        <MuiChipSelector
          className={styles.form_child}
          label="Flags"
          options={
            [
              { value: "beginner", name: PostFlagNames["beginner"] },
              { value: "mobile", name: PostFlagNames["mobile"] },
              { value: "desktop", name: PostFlagNames["desktop"] },
              { value: "urgent", name: PostFlagNames["urgent"] },
              {
                value: "login_required",
                name: PostFlagNames["login_required"],
              },
            ] as {
              value: PostFlags;
              name: string;
            }[]
          }
          setState={setPostFlags}
          state={postFlags}
        />
        <TextField
          className={styles.form_child}
          variant="filled"
          multiline
          name="content"
          minRows={8}
        />
        {pictures.length ? (
          <div className={styles.preview_container}>
            {pictures.map((pic, idx) => (
              <div className={styles.preview} key={idx}>
                <img src={pic} className={styles.preview_img} />
                <IconButton
                  className={styles.preview_close}
                  onClick={() => {
                    setPictures((state) => {
                      const newState = state.filter(
                        (_, currIdx) => currIdx != idx
                      );
                      return newState;
                    });
                  }}
                >
                  <CancelIcon
                    sx={{
                      color: "white",
                      backgroundColor: "black",
                      borderRadius: "50%",
                    }}
                  />
                </IconButton>
              </div>
            ))}
          </div>
        ) : null}
        <div className={styles.form_child}>
          <IconButton
            sx={{ cursor: "pointer" }}
            onClick={() => {
              if (pictureInputRef.current) {
                pictureInputRef.current.value = "";
                pictureInputRef.current.click();
              }
            }}
          >
            <ImageSharp />
          </IconButton>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={pictureInputRef}
          onChange={handlePictureInputChange}
          multiple
          hidden
        />

        <LoadingButton
          className={styles.form_child}
          type="submit"
          isLoading={postMut.isLoading}
          disabled={postMut.isLoading}
          isSuccess={postMut.isSuccess}
          isError={postMut.isError}
        >
          Post
        </LoadingButton>
      </form>
    </Dialog>
  );
}

function MuiChipSelector(props: {
  state: string[];
  setState: (state: string[]) => void;
  options: { name: string; value: string }[];
  className?: string;
  label: string;
  sx?: SxProps;
}) {
  return (
    <FormControl sx={props.sx} className={props.className}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        label={props.label}
        multiple
        value={props.state}
        onChange={(e) => {
          props.setState(e.target.value as string[]);
        }}
        input={<OutlinedInput label={props.label} />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
      >
        {props.options.map((item) => (
          <MenuItem key={item.name} value={item.value}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
