import setSelection from './modifiers/setSelection';
import Decorator from './decorators/block-focus';
import { SelectionState, EditorState } from 'draft-js';
import styles from './style.css';

const defaultTheme = { ...styles };

const focusPlugin = config => {
  const theme = config.theme ? config.theme : defaultTheme;
  let activeBlock = null;
  return {
    theme,
    // Wrap all block-types in block-focus decorator
    blockRendererFn: (contentBlock, { getEditorState, setEditorState, setReadOnly }) => {
      const setFocus = () => {
        if (!activeBlock || activeBlock.get('key') !== contentBlock.get('key')) {
          // Set active block to current block
          activeBlock = contentBlock;
          // Force selection to move to current block
          setEditorState(
            EditorState.forceSelection(getEditorState(), new SelectionState({
              anchorKey: activeBlock.get('key'),
              anchorOffset: activeBlock.get('length') || 0,
              focusKey: activeBlock.get('key'),
              focusOffset: activeBlock.get('length') || 0,
              hasFocus: true,
              isBackward: false,
            }))
          );
          setReadOnly(true);
        }
      };
      const unsetFocus = (direction, event) => {
        activeBlock = undefined;
        setReadOnly(false);
        if (direction && activeBlock && activeBlock.get('key') === contentBlock.get('key')) {
          activeBlock = setSelection(getEditorState, setEditorState, contentBlock, direction === 'up' ? 'previous' : 'next', event);
        } else {
          setEditorState(EditorState.forceSelection(getEditorState(), getEditorState().getSelection()));
        }
      };
      const isFocused = activeBlock && contentBlock.get('key') === activeBlock.get('key');

      // Return the decorator and feed it theme and above properties
      return {
        props: {
          unsetFocus, isFocused, setFocus
        }
      };
    },
    // Handle down/up arrow events and set activeBlock/selection if necessary
    onDownArrow: (event, { getEditorState, setEditorState, setReadOnly }) => {
      activeBlock = setSelection(getEditorState, setEditorState, activeBlock, 'next', event);
      setReadOnly(activeBlock && activeBlock.get('type') !== 'unstyled');
    }, onUpArrow: (event, { getEditorState, setEditorState, setReadOnly }) => {
      activeBlock = setSelection(getEditorState, setEditorState, activeBlock, 'previous', event);
      setReadOnly(activeBlock && activeBlock.get('type') !== 'unstyled');
    },
  };
};

export default focusPlugin;
export const FocusDecorator = Decorator({ theme: styles });
export const FocusDecoratorStyles = styles;
