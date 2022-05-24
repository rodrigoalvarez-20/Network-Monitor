import { Form } from "react-bootstrap"


const Selector = ({ dataset, def_value, action, select_name = "" }) => {

    return (
        <Form.Select onChange={action} value={def_value} name={select_name} >
            {
                dataset.map((item, i) => {
                    return (
                        <option key={i} value={item.value}>{item.label}</option>
                    )
                })
            }
        </Form.Select>
    )
}

export default Selector;