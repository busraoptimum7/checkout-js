import React, {FunctionComponent} from "react";

interface ITrustBuildingProps {
    trustElements: {
        icon: string;
        title: string;
        description?: string;
    }[];
}

const Opt7TrustBuildingElements: FunctionComponent<ITrustBuildingProps> = ({trustElements}) => {
    return (
        <div className='opt7-trust-building-container'>
            {
                trustElements.map((item, index) => (
                    <div className='trust-element' key={index}>
                        <p>{item.icon}</p>
                        <p>{item.title}</p>
                        <p>{item.description}</p>
                    </div>
                ))
            }
        </div>
    )
}

export default Opt7TrustBuildingElements;