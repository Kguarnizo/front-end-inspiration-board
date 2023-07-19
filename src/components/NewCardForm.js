import React, { useState } from 'react';
import PropTypes from 'prop-types';


const NewCardForm = (props) => {
    const cardDefaultState = {
        message: "",
      };
    
    const [formData, setFormData] = useState(cardDefaultState);

    const handleChange = (event) => {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
    
        const newFormData = {...formData, [fieldName]: fieldValue};
        setFormData(newFormData);
      };

    const handleSubmit = (event) => {
        event.preventDefault();
        const newCard = {
          message: formData.message, 
          likes_count: 0,
        }
        props.onHandleSubmit(newCard, props.selectedBoard[0].boardId);
        setFormData(cardDefaultState);
      };

    return (
        <form onSubmit={handleSubmit}>
          <div>New Card Form</div>
          <div>
            <label htmlFor="message">Message: </label>
            <input type="text" id="message" name="message" onChange={handleChange} value={formData.message}></input>
          </div>
          <div>
            <input type="submit" value="Add Card"></input>
          </div>
        </form>
      );
};

export default NewCardForm;