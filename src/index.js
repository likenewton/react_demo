import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// 折叠按钮，展开与隐藏
function Btn(props) {
  let dom = props.isCollapse ?
    <span className="btn" onClick={() => props.onClick(false)}>more</span> :
    <span className="btn" onClick={() => props.onClick(true)}>collapse</span>
  return (
    dom
  )
}

class Card extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isShowBtn: true,
      isCollapse: true,
      comments: props.comments,
    }
  }
  render() {
    const { isShowBtn, isCollapse, comments } = this.state

    return (
      <div className="comments-card">
      <div className="head">
        <span>00:00:00</span>
        <span className="grey">|</span>
        <span className="grey ellipsis text">Watch a free video course on Vue Mastery</span>
      </div>
      <div className="middle clearfix">
        <div className="left">
          <span className="avatar"></span>
        </div>
        <div className="right">
          <div>{this.props.name}</div>
          <div className="grey">1mins ago</div>
        </div>
      </div>
      <div ref={'info'} className="info clearfix">
        {this.getComments()}
        {
          isShowBtn ? 
          <Btn 
            isCollapse={isCollapse} 
            onClick={(bool) => {this.hanlderBtn(bool)}}
          /> : ''
        }
      </div>
    </div>
    );
  }

  componentDidMount = () => {
    const cssStyles = { fontSize: '14px', fontWeight: '400', lineHeight: '24px' };
    this.isElementCollision(this.state.comments, 3, cssStyles).then((isShowBtn) => {
      this.setState({
        isShowBtn: isShowBtn
      })
      if (isShowBtn) {
        // 如果是折叠的
        this.sliceComments(this.state.comments)
      }
    })
    window.addEventListener('resize', this.debounce(() => {
      this.isElementCollision(this.props.comments, 3, cssStyles).then((isShowBtn) => {
        this.setState({
          isShowBtn: isShowBtn
        });
        if (isShowBtn) {
          // 如果是折叠的
          this.sliceComments(this.props.comments)
        }
      })
    }, 200))
  };

  hanlderBtn(bool) {
    this.setState({
      isCollapse: bool
    })
  }

  sliceComments(comments, count = 15) {
    const cssStyles = { fontSize: '14px', fontWeight: '400', lineHeight: '24px' };
    this.setState({
      comments: comments.slice(0, comments.length - count) + '...'
    })
    this.isElementCollision(comments, 3, cssStyles, -100).then((isShowBtn) => {
      if (isShowBtn) {
        this.sliceComments(this.state.comments, count)
      }
    })
  }

  getComments() {
    if (this.state.isShowBtn) {
      return this.state.isCollapse ? this.state.comments : this.props.comments
    } else {
      return this.props.comments
    }
  }

  // 判断文本超出行数
  isElementCollision(text, rowCount = 3, cssStyles, offset = 0) {
    let clonedNode = document.createElement('span')
    clonedNode.innerHTML = text
    // 给clone的dom增加样式
    clonedNode.style.overflow = 'visible';
    clonedNode.style.display = 'inline-block';
    clonedNode.style.width = 'auto';
    clonedNode.style.height = '0';
    clonedNode.style.whiteSpace = 'nowrap';
    clonedNode.style.visibility = 'hidden';
    // 将传入的css字体样式赋值
    if (cssStyles) {
      Object.keys(cssStyles).forEach(item => {
        clonedNode.style[item] = cssStyles[item];
      });
    }

    // 给clone的dom增加id属性
    let _time = new Date().getTime();

    const containerID = 'collision_node_id_' + _time;
    clonedNode.setAttribute('id', containerID);

    let tmpNode = document.getElementById(containerID);
    let newNode = clonedNode;
    if (tmpNode) {
      document.body.replaceChild(clonedNode, tmpNode);
    } else {
      newNode = document.body.appendChild(clonedNode);
    }
    // 新增的dom宽度与原dom的宽度*限制行数做对比
    const differ = newNode.offsetWidth - this.refs['info'].offsetWidth * rowCount + 30 - offset;

    document.body.removeChild(newNode);
    return new Promise((resolve) => {
      resolve(differ > 0)
    })
  }

  // 节流
  throttle(fn, gapTime) {
    let _lastTime = null;
    return function() {
      let _nowTime = +new Date()
      console.log(_nowTime - _lastTime)
      if (_nowTime - _lastTime > gapTime || !_lastTime) {
        fn();
        _lastTime = _nowTime
      }
    }
  }

  // 防抖
  debounce(fn, wait) {
    var timer = null;
    return function() {
      var context = this
      var args = arguments
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(function() {
        fn.apply(context, args)
      }, wait)
    }
  }

}

class Comments extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [{
        name: 'Newton',
        comments: 'The official guide assumes intermediate level knowledge of HTML, CSS, and JavaScript. If you are totally new to frontend development, it might not be the best idea to jump right into a framework as your first step - grasp the basics then come back! Prior experience with other frameworks helps, but is not required.'
      }, {
        name: 'Alice',
        comments: 'If you prefer something more interactive, you can also check out this tutorial series on Scrimba, which gives you a mix of screencast'
      }, {
        name: 'Benner',
        comments: 'The v- prefix serves as a visual cue for identifying Vue-specific attributes in your templates. This is useful when you are using Vue.js to apply dynamic behavior to some existing markup, but can feel verbose for some frequently used directives. At the same time, the need for the v- prefix becomes less important when you are building a SPA, where Vue manages every template. Therefore, Vue provides special shorthands for two of the most often used directives, v-bind and v-on:'
      }],
    }
  }
  render() {
    const { list } = this.state

    return (
      <div className="comments">
      {
        list.map((item, i) => {
          return <Card
            key={i}
            name={item.name}
            comments={item.comments}
          />
        })
      }
      </div>
    );
  }

}

ReactDOM.render(
  <Comments />,
  document.getElementById('root')
);