import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <h2>Welcome to MSGA</h2>
      <p className="tagline">Make Scribble Hub Great Again</p>
      <p className="description">
        MSGA is a community-driven initiative aimed at identifying, tracking,
        and reporting unauthorized translations on Scribble Hub. Our goal is to
        maintain the integrity of original works and ensure that readers can
        enjoy content as intended by the authors.
      </p>

      <p className="more-info">
        Read more{' '}
        <a
          href="https://forum.scribblehub.com/threads/megathread-for-finding-identifying-and-reporting-translations.22997/"
          target="_blank"
          rel="noopener noreferrer">
          here
        </a>
        .
      </p>

      <div className="actions">
        <Link to="/report" className="action-button">
          Report a Work
        </Link>
        <Link to="/status" className="action-button">
          Check Status
        </Link>
      </div>
    </div>
  );
}

export default Home;
