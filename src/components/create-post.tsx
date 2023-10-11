import { ClientToken } from "@/utils/client_token";
import styles from "@/styles/create-post.module.css";
import { IconButton, TextField, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useRouter } from "next/router";
import { LoadingButton } from "./button";
import { api } from "@/utils/api";
import { ChangeEventHandler, FormEventHandler, useRef, useState } from "react";
import { Close, ImageSharp } from "@mui/icons-material";

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

  // TODO:
  // create a button that essentially calls the click event on an input with
  // type file; the input files will be put into state; the previews will be
  // shown; and the files will be uploaded in the new post mutation
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
                  <Close />
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
