import clsx from "clsx";
import { useCurrentAttachmentsStore } from "../state/attachments";
import { AutoAnimate } from "../util/autoAnimate";
import Collapsable from "./Collapsable";
import { ChangeEvent, useRef } from "react";
import { getUniqueId } from "../util";
import EditorAttachment from "./EditorAttachment";
import { shallow } from "zustand/shallow";

export default function EditorAttachments() {
  const attachments = useCurrentAttachmentsStore((state) =>
    state.attachments.map((a) => a.id)
  );

  const totalBytes = useCurrentAttachmentsStore((state) =>
    state.attachments.reduce((acc, curr) => acc + curr.size, 0)
  );

  const [addAttachment, clearAttachments] = useCurrentAttachmentsStore(
    (state) => [state.addAttachment, state.clearAttachments],
    shallow
  );

  const inputRef = useRef<HTMLInputElement>(null);

  function handleAddAttachment() {
    if (attachments.length >= 10) return;
    inputRef.current?.click();
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (file.size > 8_000_000) {
        alert("File too large! Max 8MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        addAttachment({
          id: getUniqueId(),
          size: file.size,
          name: file.name,
          description: null,
          data_url: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <Collapsable
      id="attachments"
      title="Attachments"
      size="large"
      defaultCollapsed={true}
      valiationPathPrefix="attachments"
      extra={
        <div className="flex space-x-2">
          <div className="text-sm italic font-light text-gray-400">
            {attachments.length} / 10
          </div>
          <div
            className={clsx(
              "text-sm italic font-light",
              totalBytes < 8_000_000 ? "text-gray-400" : "text-red"
            )}
          >
            {Math.round(totalBytes / 10_000) / 100} / 8MB
          </div>
        </div>
      }
    >
      <div className="text-gray-400 mb-3">
        Attachments do currently not appear in the preview.
      </div>
      <AutoAnimate className="flex flex-wrap">
        {attachments.map((id, i) => (
          <EditorAttachment index={i} id={id} key={id} />
        ))}
      </AutoAnimate>
      <div className="space-x-3">
        <button
          className={clsx(
            "px-3 py-2 rounded text-white",
            attachments.length < 10
              ? "bg-blurple hover:bg-blurple-dark"
              : "bg-dark-3 cursor-not-allowed"
          )}
          onClick={handleAddAttachment}
        >
          Add Attachment
        </button>
        <button
          className="px-3 py-2 rounded text-white border-red border-2 hover:bg-red"
          onClick={clearAttachments}
        >
          Clear Attachments
        </button>
      </div>

      <input
        type="file"
        className="hidden"
        ref={inputRef}
        onChange={handleFileSelected}
        multiple={attachments.length < 9}
      />
    </Collapsable>
  );
}
