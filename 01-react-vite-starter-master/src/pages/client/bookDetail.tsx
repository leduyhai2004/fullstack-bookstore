import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getBookAPI, getBookDetailAPI } from '../../services/api';

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState<IBookTable | null>(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      if (!id) return;

      const res = await getBookDetailAPI(id);

      if (res && res.data) {
        setBook(res.data);
      }
    };

    fetchBookDetail();
  }, [id]);

  return <div>{book?.mainText}</div>;
};

export default BookDetailPage;