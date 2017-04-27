import * as  React from 'react';

export default class Loader extends React.Component<any,any>{
	constructor(props:any){
        super(props)       
	}
	render(){
	
		return (<div><img src="/assets/images/Loading_icon.gif" className="img-responsive center-block" width={200} /></div>);
	}
}
