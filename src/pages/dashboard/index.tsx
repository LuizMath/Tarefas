import styles from "@/pages/dashboard/styles.module.css";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { Textarea } from "@/components/TextArea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import {
  ChangeEvent,
  Suspense,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import {
  addDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebaseConnection";
import Link from "next/link";

interface HomeProps {
  user: {
    email: string;
  };
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: HomeProps) {
  const [input, setInput] = useState<string>("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const handleChangePublic = (e: ChangeEvent<HTMLInputElement>) => {
    setPublicTask(e.target.checked);
  };

  useEffect(() => {
    const loadTasks = async () => {
      const tarefasRef = collection(db, "tarefas");
      const q = query(
        tarefasRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email),
      );
      onSnapshot(q, (snapshot) => {
        let list = [] as TaskProps[];
        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public,
          });
        });
        setTasks(list);
      });
    };
    loadTasks();
  }, [user?.email]);
  const handleRegisterTask = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input === "") {
      return;
    }
    try {
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });
      setInput("");
      setPublicTask(false);
    } catch (error: unknown) {}
  };
  const handleShare = async (id: string) => {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`,
    );
  };
  const handleDeleteTask = async (id: string) => {
    const docRef = doc(db, "tarefas", id);
    await deleteDoc(docRef);
  };
  return (
    <Suspense fallback="carregando info...">
      <div className={styles.container}>
        <Head>
          <title>Meu Painel de tarefas</title>
        </Head>
        <main className={styles.main}>
          <section className={styles.content}>
            <div className={styles.contentForm}>
              <h1 className={styles.title}>Qual a sua tarefa?</h1>
              <form onSubmit={handleRegisterTask}>
                <Textarea
                  placeholder="Digite qual a sua tarefa?"
                  value={input}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setInput(e.target.value)
                  }
                />
                <div className={styles.checkboxArea}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    onChange={handleChangePublic}
                  />
                  <label>Deixar tarefa pública?</label>
                </div>
                <button className={styles.button} type="submit">
                  Registrar
                </button>
              </form>
            </div>
          </section>
          <section className={styles.taskContainer}>
            <h1>Minhas tarefas</h1>
            {tasks.map((item) => (
              <article key={item.id} className={styles.task}>
                {item.public && (
                  <div className={styles.tagContainer}>
                    <label className={styles.tag}>PÚBLICO</label>
                    <button
                      className={styles.shareButton}
                      onClick={() => handleShare(item.id)}
                    >
                      <FiShare2 size={22} color="#3183ff" />
                    </button>
                  </div>
                )}
                <div className={styles.taskContent}>
                  {item.public ? (
                    <Link href={`/task/${item.id}`}>
                      <p>{item.tarefa}</p>
                    </Link>
                  ) : (
                    <p>{item.tarefa}</p>
                  )}
                  <button
                    className={styles.trashButton}
                    onClick={() => handleDeleteTask(item.id)}
                  >
                    <FaTrash size={24} color="#ea3140" />
                  </button>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </Suspense>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  await new Promise((resolve) => setTimeout(() => resolve("some value"), 2000));
  const session = await getSession({ req });
  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
