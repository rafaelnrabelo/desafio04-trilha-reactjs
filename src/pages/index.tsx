import { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextPage<HomeProps> = ({ postsPagination }) => {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMorePosts = async (): Promise<void> => {
    const response = await fetch(nextPage);
    const json = await response.json();
    setPosts(oldPosts => [...oldPosts, ...json.results]);
    setNextPage(json.next_page);
  };

  return (
    <>
      <Header className={styles.homeHeader} />
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar size={20} />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM  yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>

                  <FiUser size={20} />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              type="button"
              className={styles.loadMore}
              onClick={handleLoadMorePosts}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  return {
    props: {
      postsPagination: {
        results: postsResponse.results,
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};
