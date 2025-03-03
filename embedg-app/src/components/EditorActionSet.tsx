import { shallow } from "zustand/shallow";
import { useCurrentMessageStore } from "../state/message";
import EditorAction from "./EditorAction";
import Collapsable from "./Collapsable";
import { getUniqueId } from "../util";
import { AutoAnimate } from "../util/autoAnimate";

interface Props {
  setId: string;
}

export default function EditorActionSet({ setId }: Props) {
  const actions = useCurrentMessageStore(
    (state) => state.actions[setId]?.actions.map((a) => a.id) || [],
    shallow
  );

  const [addAction, clearActions] = useCurrentMessageStore(
    (state) => [state.addAction, state.clearActions],
    shallow
  );

  function add() {
    addAction(setId, {
      id: getUniqueId(),
      type: 1,
      text: "",
    });
  }

  return (
    <Collapsable
      id={`actions.${setId}`}
      valiationPathPrefix={`actions.${setId}`}
      title="Actions"
      extra={
        <div className="text-sm italic font-light text-gray-400">
          {actions.length} / 2
        </div>
      }
    >
      <AutoAnimate className="space-y-2">
        {actions.map((id, i) => (
          <EditorAction setId={setId} actionIndex={i} key={id} />
        ))}
      </AutoAnimate>
      <div className="space-x-3 mt-3 text-sm">
        {actions.length < 2 ? (
          <button
            className="bg-blurple px-3 py-2 rounded transition-colors hover:bg-blurple-dark text-white"
            onClick={add}
          >
            Add Action
          </button>
        ) : (
          <button
            disabled
            className="bg-dark-2 px-3 py-2 rounded transition-colors cursor-not-allowed text-gray-300"
          >
            Add Action
          </button>
        )}
        <button
          className="px-3 py-2 rounded border-2 border-red hover:bg-red transition-colors text-white"
          onClick={() => clearActions(setId)}
        >
          Clear Actions
        </button>
      </div>
    </Collapsable>
  );
}
