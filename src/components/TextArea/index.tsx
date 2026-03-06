import styles from "@/components/TextArea/styles.module.css";
import { HTMLProps } from "react";
export function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
  return <textarea className={styles.textarea} {...rest}></textarea>;
}
