import Head from "next/head";
import styles from "@/styles/home.module.css";
import Image from "next/image";
import heroImg from "../../public/assets/hero.png";
import { GetStaticProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConnection";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.logoContent}>
            <Image
              className={styles.hero}
              alt="Logo tarefas+"
              src={heroImg}
              priority
            />
          </div>
          <h1 className={styles.title}>
            Sistema feito para você organizar
            <br /> seus estudos e tarefas
          </h1>
          <div className={styles.infoContent}>
            <section className={styles.box}>
              <span>+{posts} posts</span>
            </section>
            <section className={styles.box}>
              <span>+{comments} comentários</span>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas");
  const commentsSnapShot = await getDocs(commentRef);
  const postsSnapShot = await getDocs(postRef);

  return {
    props: {
      posts: postsSnapShot.size || 0,
      comments: commentsSnapShot.size || 0,
    },
    revalidate: 60,
  };
};
