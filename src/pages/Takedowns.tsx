import { useState, useEffect } from 'react';
import { getWorks } from '../services/mockBackend';
import WorkItem from '../components/WorkItem';
import type { Work } from '../types/Work';

function Takedowns() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const data = await getWorks();
        setWorks(data.filter(work => work.status === 'taken_down'));
      } catch (error) {
        console.error('Error fetching works:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="takedowns-page">
      <h2>Taken Down Works</h2>

      <div className="work-list">
        {works.length === 0 ? (
          <p>No works have been taken down yet.</p>
        ) : (
          works.map(work => <WorkItem key={work.id} work={work} />)
        )}
      </div>
    </div>
  );
}

export default Takedowns;
