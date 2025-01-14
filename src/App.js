import { useState, useEffect } from "react";
import axios from "axios";
import BoardList from "./components/BoardList";
import NewBoardForm from "./components/NewBoardForm";
import SelectedBoard from "./components/SelectedBoard";
import SelectedBoardCardList from "./components/SelectedBoardCardList";
import NewCardForm from "./components/NewCardForm";
import getResponseError from "./errorUtils.js";
import "./App.css";
import inspoicon from "./inspoicon.svg"


const kBaseUrl = "http://127.0.0.1:5000";

const convertFromApi = (apiBoard) => {
  const { board_id, title, owner } = apiBoard;
  const newBoard = { title, owner, boardId: board_id };
  return newBoard;
};

const getAllBoards = () => {
  return axios
    .get(`${kBaseUrl}/boards`)
    .then((response) => {
      return response.data.map(convertFromApi);
    })
    .catch((error) => {
    });
};

const cardListFromApi = (apiCard) => {
  const { card_id, message, likes_count} = apiCard;
  const newCard = {message, likesCount: likes_count, cardId: card_id};
  return newCard;
};

const getAllCardsOneBoard = (boardId) => {
  return axios
  .get(`${kBaseUrl}/boards/${boardId}/cards`)
  .then((response) => {
    return response.data.map(cardListFromApi);
  })
  .catch((error) => {
  });
};

const updateLikesCount = (cardId, likeStatus) => {
  const endpoint = likeStatus ? 'increase' : 'decrease';
  return axios
    .patch(`${kBaseUrl}/cards/${cardId}/${endpoint}`)
    .then((response) => {
      const updatedCard = cardListFromApi(response.data);
        return updatedCard
    })
    .catch((error) => {
    });
};

const updateCardMessage = (cardId, data) => {
  return axios
  .patch(`${kBaseUrl}/cards/${cardId}`, data)
  .then((response) => {
    const updatedCard = cardListFromApi(response.data);
      return updatedCard
  })
  .catch((error) => {
  });
}

const deleteCard = (cardId) => {
  return axios 
  .delete(`${kBaseUrl}/cards/${cardId}`)
  .catch((error) => {
  });
};

const App = () => {

  const [boardState, setBoardState] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [cardState, setCardState] = useState([]);
  const [error, setError] = useState(null);

  const fetchBoards = () =>{
    getAllBoards().then((boards)=>{
      setBoardState(boards);
    })
  }

  useEffect(()=>{
    fetchBoards();
  },[]);

  const findBoardById = (boardId) => {
    return boardState.find((board) => board.boardId === boardId)
  };

  const fetchCards = (boardId) =>{
    getAllCardsOneBoard(boardId).then((cards)=>{
      setCardState(cards);
    })
  }

  const handleBoardSelection = (boardId) => {
    let board = findBoardById(boardId);
    setSelectedBoard(board);
    fetchCards(boardId);
  };

  const onHandleCardSubmit = (data) => {
    axios.post(`${kBaseUrl}/boards/${selectedBoard.boardId}/cards`, data)
      .then((response) => {
        setCardState((prevCards) => [cardListFromApi(response.data), ...prevCards]);
        setError(null);
      })
      .catch((e) => {
        const errorMessage = getResponseError(e);
        setError(errorMessage);
      });
  };

  const onHandleBoardSubmit = (data) => {
    axios.post(`${kBaseUrl}/boards`, data)
      .then((response) => {
        setBoardState((prevBoards) => [convertFromApi(response.data.board), ...prevBoards]);
        setError(null);
      })
      .catch((e) => {
        const errorMessage = getResponseError(e);
        setError(errorMessage);
  });
}
  
  const onUnregister = (cardId) => {
    deleteCard(cardId).then(() => {
      setCardState((oldData) => {
        return oldData.filter((card) => card.cardId !== cardId);
      });
    });
  };

  const onLikeCard = (cardId, likeStatus) => {
    updateLikesCount(cardId, likeStatus).then((updatedCard) => {
      setCardState((oldData) => {
        return oldData.map((card) => {
          if (card.cardId === cardId) {
            return updatedCard;
          }
          return card;
        });
      });
    });
  };

  const onUpdateMessage = (cardId, message) => {
    updateCardMessage(cardId, message).then((updatedCard) => {
      setCardState((oldData) => {
        return oldData.map((card) => {
          if (card.cardId === cardId) {
            return updatedCard;
          }
          return card;
        });
      });
    });
  };


  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Welcome to Inspiration Board</h1>
          <hr/>
          <p>Create and view boards of inspiration && capture your inspirations in detail </p>
          <p> ⇿ add, edit, and delete cards as well as give them a +1 like boost ⇿ </p>
        </div>
      </header>
      <section className="sidebar">
        <p className="inspo">Inspiration Board</p>
        <div className="img-container">
          <img src={inspoicon} alt="inspo logo" /> 
        </div>
        <div>
          <NewBoardForm onHandleBoardSubmit={onHandleBoardSubmit} error={error} />
        </div>
      </section>
      <main className="content">
        <section>
          <div>
            <BoardList boardData={boardState} onSelectBoard={handleBoardSelection} />
          </div>
          <div>
            <SelectedBoard boardState={selectedBoard} />
          </div>       
        </section>
          <div>
            <SelectedBoardCardList selectedBoard={selectedBoard} cardList={cardState} onUnregister={onUnregister} onLikeCard={onLikeCard} onUpdateMessage={onUpdateMessage} />
          </div>
            {selectedBoard && 
            (<div className="card-form-container">
              <NewCardForm selectedBoard={selectedBoard} onHandleCardSubmit={onHandleCardSubmit} error={error} />
            </div>)}
      </main>
    </div>
  );
}


export default App;
