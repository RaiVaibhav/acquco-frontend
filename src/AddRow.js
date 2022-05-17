import React, { useState } from "react";
import { Modal, Button, Input, Form, notification } from "antd";
import axios from "axios";

const AddRow = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const data = await form.validateFields();
    debugger;
    try {
      await axios.post("http://raivaibhav08.pythonanywhere.com/persons/", {
        ...data,
      });
      notification['success']({
        message: '',
        description: 'Row Added successfully',
      });
    } catch (err) {
      notification['info']({
        message: '',
        description: 'Something went wrong',
      });
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Add data
      </Button>
      <Modal
        title="Basic Modal"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} component={false}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Age"
            name="age"
            rules={[{ required: true, message: "Please input your age!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default AddRow;
