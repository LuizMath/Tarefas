import Head from "next/head";
import styles from "@/pages/task/styles.module.css";
import { GetServerSideProps } from "next";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import { Textarea } from "@/components/TextArea";
import { useSession } from "next-auth/react";
import { ChangeEvent, SyntheticEvent, useState } from "react";
import { FaTrash } from "react-icons/fa";
interface TaskProps {
  item: {
    tarefa: string;
    created: string;
    taskId: string;
    public: boolean;
    user: string;
  };
  allComments: CommentsProps[];
}

interface CommentsProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}
export default function Task({ item, allComments }: TaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState<string>("");
  const [comments, setComments] = useState<CommentsProps[]>(allComments || []);
  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input === "") return;
    if (!session?.user?.email || !session?.user?.name) return;
    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item.taskId,
      });
      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item.taskId,
      };
      setInput("");
      setComments([...comments, data]);
    } catch (error: unknown) {
      console.log(error);
    }
  };
  const handleDeleteComment = async (id: string) => {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);
      setComments(comments.filter((c) => c.id !== id));
    } catch (error: unknown) {
      console.log(error);
    }
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefa - Detalhes da Tarefa</title>
      </Head>
      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>
      <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>
        <form onSubmit={handleSubmit}>
          <Textarea
            value={input}
            placeholder="Digite seu comentário"
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
          />
          <button disabled={!session?.user} className={styles.button}>
            Enviar comentário
          </button>
        </form>
      </section>
      <section className={styles.commentsContainer}>
        <h2>Todos os comentários</h2>
        {comments.length === 0 && (
          <div style={{ marginTop: "20px" }}>
            <span>Nenhum comentário foi encontrado...</span>
          </div>
        )}
        {comments.map((item) => (
          <article key={item.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{item.name}</label>
              {item.user === session?.user?.email && (
                <button
                  className={styles.buttonTrash}
                  onClick={() => handleDeleteComment(item.id)}
                >
                  <FaTrash size={18} color="#ea3140" />
                </button>
              )}
            </div>
            <p>{item.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  const docRef = doc(db, "tarefas", id as string);
  const q = query(
    collection(db, "comments"),
    where("taskId", "==", id as string),
  );
  const snapshotComments = await getDocs(q);
  let allComments: CommentsProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  });
  const snapshot = await getDoc(docRef);
  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const miliseconds = snapshot.data()?.created?.seconds * 1000;
  const task = {
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  };

  return {
    props: {
      item: task,
      allComments,
    },
  };
};
