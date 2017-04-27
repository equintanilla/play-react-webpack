import * as  React from 'react';

export default class MessageBox extends React.Component<any,any>{
	constructor(props:any){
        super(props)       
	}
	render(){
	
		return (<div className="center-block msg-box" > <strong>{this.props.message}</strong> </div>);
	}
}
