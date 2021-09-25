import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const Post: NextPage<PostProps> = ({ post }) => {
  const router = useRouter();

  const postLength = Math.ceil(
    post?.data?.content?.reduce((sum, current) => {
      let total = sum;
      total += current.heading.split(' ').length;
      total += RichText.asText(current.body).split(' ').length;

      return total;
    }, 0) / 200
  );

  return (
    <>
      <Header />
      {router.isFallback ? (
        <h1>Carregando...</h1>
      ) : (
        <>
          {post.data.banner.url && (
            <img
              src={post.data.banner.url}
              alt={post.data.title}
              className={styles.banner}
            />
          )}
          <main className={commonStyles.container}>
            <article className={styles.post}>
              <h1>{post.data.title}</h1>
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

                <FiClock size={20} />
                <span>{postLength} min</span>
              </div>

              {post.data.content.map(content => (
                <div className={styles.content} key={content.heading}>
                  <h2>{content.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </div>
              ))}
            </article>
          </main>
        </>
      )}
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { orderings: '[document.first_publication_date desc]', pageSize: 2 }
  );

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const slug = params?.slug;

  const response = await prismic.getByUID('posts', String(slug), {});

  return { props: { post: response } };
};
