import { Link } from 'react-router-dom';

function Home() {
	return (
		<div className='home-page'>
			<h2>Welcome to MSGA</h2>
			<p>Make ScribbleHub Great Again</p>

			<div className='actions'>
				<Link
					to='/report'
					className='action-button'
				>
					Report a Work
				</Link>
				<Link
					to='/status'
					className='action-button'
				>
					Check Status
				</Link>
			</div>
		</div>
	);
}

export default Home;
