import * as  React from 'react';

export default class MockupLabelAsPoint extends React.Component <any,any>{
	propTypes :{
		getClusterInfo: React.PropTypes.func,
	}
	constructor(props:any){
        super(props)       
    }
    onClick = () => {
        const { index, key, payload } = this.props;		
		this.props.getClusterInfo(payload.cluster_info);
    }
	
    render() {
        const { x, y } = this.props;
        return (
            <circle
                className='dot'
                onClick={this.onClick}
                cx={x}
                cy={y}
                r={8}
                fill="transparent"/>
        );
    }
}