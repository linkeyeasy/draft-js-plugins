import React, { Component } from 'react';
import { FocusDecorator } from 'draft-js-focus-plugin';
import { DraggableDecorator } from 'draft-js-dnd-plugin';
import { ToolbarDecorator } from 'draft-js-toolbar-plugin';

const TableComponent = ({ theme, renderNestedEditor }) => class Table extends Component {
  constructor(props) {
    super();
    this.state = {
      rows: props.blockProps.rows || [[]],
      numberOfColumns: props.blockProps.numberOfColumns || 1,
      focusedEdit: null
    };
  }

  componentDidMount() {
    const { addActions } = this.props;
    if (addActions) {
      addActions([{
        button: <span>+ Row</span>,
        label: 'Add a row',
        active: false,
        toggle: () => this.addRow(),
      }, {
        button: <span>+ Column</span>,
        label: 'Add a column',
        active: false,
        toggle: () => this.addColumn(),
      }]);
    }
  }

  setFocus = (row, column) => {
    const { setFocus } = this.props;
    setFocus();
    this.setState({ focusedEdit: { row, column } });
  }

  addRow = () => {
    const { setEntityData } = this.props.blockProps;
    const { rows } = this.state;
    const newRows = [...rows, []];
    setEntityData({ rows: newRows });
    this.setState({ rows: newRows });
  }

  addColumn = () => {
    const { setEntityData } = this.props.blockProps;
    const { numberOfColumns } = this.state;
    const newNumberOfColumns = (numberOfColumns || 1) + 1;
    setEntityData({ numberOfColumns: newNumberOfColumns });
    this.setState({ numberOfColumns: newNumberOfColumns });
  }

  updateEntityData = (editorState, row, column) => {
    const { setEntityData } = this.props.blockProps;
    const { rows, numberOfColumns } = this.state;
    const newRows = rows || [{}];
    while (newRows[row].length < (numberOfColumns || 1)) {
      newRows[row].push(null);
    }
    newRows[row][column] = editorState;
    setEntityData({ rows: newRows });
    this.setState({ rows: newRows });
  }

  render() {
    const { rows, numberOfColumns, focusedEdit } = this.state;
    const { style, className, blockProps } = this.props;
    const { isFocused } = blockProps;

    const classNames = [className, theme.table].filter(p => p);

    return (
      <table className={classNames.join(' ')} cellSpacing="0" style={style}>
        <tbody>
        {rows.map((row, rowI) =>
          <tr key={rowI}>
            {Array.from(new Array(numberOfColumns), (x, i) => i).map((column, columnI) =>
              <td key={columnI}>{renderNestedEditor(
                this,
                row[columnI],
                (editorState) => this.updateEntityData(editorState, rowI, columnI),
                () => this.setFocus(rowI, columnI),
                isFocused && focusedEdit && focusedEdit.row === rowI && focusedEdit.column === columnI
              )}</td>
            )}
          </tr>
        )}
        </tbody>
      </table>
    );
  }
};

export default (options) => FocusDecorator(
  DraggableDecorator(
    ToolbarDecorator()(
      TableComponent(options)
    )
  )
);
