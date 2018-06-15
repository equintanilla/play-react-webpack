import React from 'react';

class Greeter extends React.Component {
    render() {
        return (
            <div>
                <p>Hello, <a href="#">{this.props.name}</a></p>
                <p>Bye, <a href="#">{this.props.name}</a></p>
            </div>
        );
    }
}

export default Greeter;
