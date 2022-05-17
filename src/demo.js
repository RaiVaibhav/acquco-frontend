import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import "./index.css";
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Typography,
  Pagination,
  notification,
} from "antd";
import axios from "axios";
import AddRow from "./AddRow";

const fields = ["name", "age", "address"];

const convertDataToMap = (data) => {
  return data.reduce((map, i) => {
    return map.set(i.id, i);
  }, new Map());
};

const EditableRow = (props) => {
  return <tr {...props} />;
};

const MemoEdittableRow = React.memo(EditableRow, (prevProps, nextProps) => {
  const previousData = prevProps.dataMap.get(prevProps["data-row-key"]);
  const nextData = nextProps.dataMap.get(nextProps["data-row-key"]);
  if (previousData && nextData) {
    return fields.every((i) => previousData[i] === nextData[i]);
  }
  return true;
});

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [dataMap, setDataMap] = useState(convertDataToMap(data));
  const [editingKey, setEditingKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const isEditing = (record) => record.id === editingKey;
  const fetchData = async (page, showLoading = true) => {
    showLoading && setIsLoading(true);
    try {
      const {
        data: { count, results },
      } = await axios.get(
        `http://raivaibhav08.pythonanywhere.com/persons?page=${page}`
      );
      setDataWithMap(results);
      setTotalCount(count);
    } catch (err) {
      notification["info"]({
        message: "",
        description: "Something went wrong",
      });
    }
    showLoading && setIsLoading(false);
  };

  const setDataWithMap = (data) => {
    setData(data);
    setDataMap(convertDataToMap(data));
  };

  useEffect(() => {
    fetchData(page);
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      age: "",
      address: "",
      ...record,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(
        `http://raivaibhav08.pythonanywhere.com/person/${editingKey}`
      );
      await fetchData(page);
    } catch (err) {
      notification['info']({
        message: '',
        description: 'Something went wrong',
      });
    }
    setIsLoading(false);
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setDataWithMap(newData);
      setEditingKey("");

      // silently save the data to backend
      await axios.put(`http://raivaibhav08.pythonanywhere.com/person/${key}/`, {
        ...item,
      });
    } catch (errInfo) {
      notification['error']({
        message: '',
        description: 'Validation failed',
      });
    }
  };

  const columns = [
    {
      title: "name",
      dataIndex: "name",
      width: "25%",
      editable: true,
      shouldCellUpdate: (record, prevRecord) => {
        return record.name === prevRecord.name;
      },
    },
    {
      title: "age",
      dataIndex: "age",
      width: "15%",
      editable: true,
      shouldCellUpdate: (record, prevRecord) => {
        return record.age === prevRecord.age;
      },
    },
    {
      title: "address",
      dataIndex: "address",
      width: "40%",
      editable: true,
      shouldCellUpdate: (record, prevRecord) => {
        return record.address === prevRecord.address;
      },
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.id)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a
                style={{
                  marginRight: 8,
                }}
              >
                Cancel
              </a>
            </Popconfirm>
            <Popconfirm title="Sure to delete?" onConfirm={onDelete}>
              <a
                style={{
                  color: "red",
                }}
              >
                Delete
              </a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        );
      },
      shouldCellUpdate: false,
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
              row: (props) => <MemoEdittableRow {...props} dataMap={dataMap} />,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
          loading={isLoading}
          rowKey="key"
        />
        <Pagination
          defaultCurrent={1}
          style={{
            margin: "1rem 0 1rem 0",
          }}
          current={page}
          defaultPageSize={10}
          hideOnSinglePage={true}
          total={totalCount}
          onChange={(page) => setPage(page)}
          showSizeChanger={false}
        />
      </Form>
      <AddRow onDataAdd={() => fetchData(page)} />
    </>
  );
};

export default () => <EditableTable />;
