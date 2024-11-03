import type { CommentaryItem } from "../types/commentary";
import { formatOversToFloat } from "../utils/converters";

interface Props {
  commentaryList: CommentaryItem[];
}

const Commentary = ({ commentaryList }: Props) => {
  return (
    <div>
      {/* <OverSummary /> */}
      {commentaryList.map((item, itemIdx) => (
        <div key={itemIdx} className="flex text-sm mb-3 leading-6">
          {item.overs ? (
            <div className="font-bold mr-4">
              {formatOversToFloat(item.overs)}
            </div>
          ) : null}
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: item.commText }}
          ></div>
        </div>
      ))}
      {/* load button */}
    </div>
  );
};

export default Commentary;
