import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <h2>Welcome to MSGA</h2>
      <p className="tagline">Make Scribble Hub Great Again</p>
      <p className="description">
        MSGA is a community-driven initiative aimed at identifying, tracking,
        and reporting unauthorized translations on Scribble Hub. Our goal is to
        help administrators identify and remove translations.
      </p>

      <div className="actions">
        <Link to="/report" className="action-button">
          Report a Work
        </Link>
        <Link to="/status" className="action-button">
          Check Status
        </Link>
      </div>
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
    </div>
  );
}

export default Home;
