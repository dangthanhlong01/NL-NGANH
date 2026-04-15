import React, { useEffect, useState, useRef } from 'react';
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { loadMessage } from '../../services/userService'
import moment from 'moment';
require('dotenv').config();
const host = process.env.REACT_APP_BACKEND_URL;

function ChatWindow(props) {
  const [mess, setMess] = useState([]);
  const [userData, setuserData] = useState({});
  const [message, setMessage] = useState('');
  const [id, setId] = useState();
  const [user, setUser] = useState({})
  const socketRef = useRef();
  const chatBoxRef = useRef();
  const [activeMsg, setActiveMsg] = useState(null)
  let scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }

  let handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [mess])

  useEffect(() => {
    socketRef.current = socketIOClient.connect(host)
    const userData = JSON.parse(localStorage.getItem('userData'));
    setUser(userData)

    socketRef.current.on('getId', data => {
      setId(data)
    })

    if (props.roomId) {
      fetchMessage()
    }

    socketRef.current.on('sendDataServer', dataGot => {
      fetchMessage()
    })

    return () => {
      socketRef.current.disconnect();
    };
  }, [props.roomId]);

  let fetchMessage = async () => {
    let res = await loadMessage(props.roomId, props.userId)
    if (res) {
      setMess(res.data)
      setuserData(res.data.userData)
    }
  }

  let sendMessage = () => {
    if (message !== null && message !== '') {
      const msg = {
        text: message,
        userId: user.id,
        roomId: props.roomId,
        userData: userData,
      }
      socketRef.current.emit('sendDataClient', msg)
      setMessage('')
    }
  }

  return (
    <>
      

      <div className="ks-messages ks-messenger__messages">
        <div className="ks-header">
          <div className="ks-description">
            <div className="ks-name">Chat name</div>
            <div className="ks-amount">2 members</div>
          </div>
          <div className="ks-controls">
            <div className="dropdown">
              <button className="btn btn-primary-outline ks-light ks-no-text ks-no-arrow" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ color: '#333' }} >
                <span className="la la-ellipsis-h ks-icon" />
              </button>
              <div className="dropdown-menu dropdown-menu-right ks-simple" aria-labelledby="dropdownMenuButton">
                <a className="dropdown-item" href="#!"><span className="la la-user-plus ks-icon" /><span className="ks-text">Add members</span></a>
                <a className="dropdown-item" href="#!"><span className="la la-eye-slash ks-icon" /><span className="ks-text">Mark as unread</span></a>
                <a className="dropdown-item" href="#!"><span className="la la-bell-slash-o ks-icon" /><span className="ks-text">Mute notifications</span></a>
                <a className="dropdown-item" href="#!"><span className="la la-mail-forward ks-icon" /><span className="ks-text">Forward</span></a>
                <a className="dropdown-item" href="#!"><span className="la la-ban ks-icon" /><span className="ks-text">Spam</span></a>
                <a className="dropdown-item" href="#!"><span className="la la-trash-o ks-icon" /><span className="ks-text">Delete</span></a>
              </div>
            </div>
          </div>
        </div>

        <div className="ks-body ks-scrollable" style={{ padding: '0px', width: '760px' }}>
          <ul
            id="box-chat"
            ref={chatBoxRef}
            className="ks-items"
            style={{ overflowY: 'scroll', maxHeight: '450px', margin: 0, padding: '10px 0', listStyle: 'none' }}
          >
            {mess && mess.length > 0 &&
              mess.map((item, index) => {
                if (item.userData) {
                  //  isMe = true → tin nhắn của mình
                  const isMe = item.userData.id == user.id
                  return (
                    <li
                      key={index}
                      className={`${isMe ? "ks-item ks-mine" : "ks-item ks-other"} ${activeMsg === index ? 'active' : ''}`}
                      onClick={() => setActiveMsg(activeMsg === index ? null : index)} //  click lần 2 thì ẩn lại
                    >
                      {/* Avatar */}
                      <span className="ks-avatar">
                        <img src={item.userData.image} width={36} height={36} className="rounded-circle" style={{ objectFit: 'cover' }} />
                      </span>
                      {/* Nội dung — BỎ tên, chỉ giữ bubble và thời gian */}
                      <div className="ks-content">
                        <div className="ks-bubble">{item.text}</div>
                        <div className="ks-datetime">{moment(item.createdAt).fromNow()}</div>
                      </div>
                    </li>
                  )
                }
              })
            }
          </ul>
        </div>

        <div className="ks-footer" style={{ width: '900px' }}>
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            value={message}
            className="form-control"
            placeholder="Vui lòng nhập tin nhắn..."
          />
          <div className="ks-controls">
            <button onClick={() => sendMessage()} className="btn btn-primary">Gửi</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatWindow;