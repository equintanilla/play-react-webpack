import * as  React from 'react';

export default class MockupLabelAsPoint extends React.Component <any,any>{

	constructor(props:any){
        super(props)       
    }
	
    render() {
        const { x, y } = this.props;
        return (
            <circle
                className='dot'
                cx={x}
                cy={y}
                r={8}
                fill="transparent"/>
        );
    }
}