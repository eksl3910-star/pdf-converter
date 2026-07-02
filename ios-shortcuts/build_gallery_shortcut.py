#!/usr/bin/env python3
"""Build 갤러리 전송.shortcut plist."""
import plistlib
import uuid
from pathlib import Path

OUT = Path(__file__).with_name("갤러리-전송.shortcut")
WORKSPACE_OUT = Path("/workspace/갤러리-전송.shortcut")


def uid() -> str:
    return str(uuid.uuid4()).upper()


def action_ref(output_uuid: str, output_name: str = "Photos"):
    return {
        "Value": {
            "OutputUUID": output_uuid,
            "Type": "ActionOutput",
            "OutputName": output_name,
        },
        "WFSerializationType": "WFTextTokenAttachment",
    }


def variable_ref(
    output_uuid: str,
    output_name: str,
    *,
    coercion: str | None = None,
):
    """Conditional actions require the Variable wrapper (shows up linked in Shortcuts UI)."""
    value: dict = {
        "Type": "ActionOutput",
        "OutputUUID": output_uuid,
        "OutputName": output_name,
    }
    if coercion:
        value["Aggrandizements"] = [
            {
                "Type": "WFCoercionVariableAggrandizement",
                "CoercionItemClass": coercion,
            }
        ]
    return {
        "Type": "Variable",
        "Variable": {
            "Value": value,
            "WFSerializationType": "WFTextTokenAttachment",
        },
    }


def repeat_item_ref():
    return {
        "Type": "Variable",
        "Variable": {
            "Value": {"Type": "Variable", "VariableName": "Repeat Item"},
            "WFSerializationType": "WFTextTokenAttachment",
        },
    }


def media_filter(media_type: str, input_ref: dict, custom_name: str, filter_uuid: str):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.filter.images",
        "WFWorkflowActionParameters": {
            "UUID": filter_uuid,
            "CustomOutputName": custom_name,
            "WFContentItemInputParameter": input_ref,
            "WFContentItemFilter": {
                "Value": {
                    "WFActionParameterFilterPrefix": 1,
                    "WFContentPredicateBoundedDate": False,
                    "WFActionParameterFilterTemplates": [
                        {
                            "Operator": 4,
                            "Property": "Media Type",
                            "Removable": True,
                            "Values": {
                                "Unit": 4,
                                "Enumeration": {
                                    "Value": media_type,
                                    "WFSerializationType": "WFStringSubstitutableState",
                                },
                            },
                        }
                    ],
                },
                "WFSerializationType": "WFContentPredicateTableTemplate",
            },
        },
    }


def save_file(
    input_ref: dict,
    *,
    subpath: str,
    service: str,
):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.documentpicker.save",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "WFInput": input_ref,
            "WFAskWhereToSave": False,
            "WFSaveFileOverwrite": True,
            "WFFileStorageService": service,
            "WFFileDestinationPath": {
                "Value": {"string": subpath, "attachmentsByRange": {}},
                "WFSerializationType": "WFTextTokenString",
            },
        },
    }


def kim_notify(message: str):
    """알림 제목 김도훈 + 오류 본문 (단일 단축어 내장)."""
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.notification",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "WFNotificationActionTitle": "김도훈",
            "WFNotificationActionBody": {
                "Value": {"string": message, "attachmentsByRange": {}},
                "WFSerializationType": "WFTextTokenString",
            },
            "WFNotificationActionSound": True,
        },
    }


def kim_notify_fatal(message: str):
    return [kim_notify(message), exit_shortcut()]


def exit_shortcut():
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.exit",
        "WFWorkflowActionParameters": {"UUID": uid()},
    }


def if_no_media_to_save(photo_count_uuid: str, video_count_uuid: str, destination_label: str):
    """When neither photos nor videos matched after filter."""
    msg = f"{destination_label} 저장 실패: 사진·동영상으로 인식된 파일이 없어."
    return if_count_gt_zero_else(
        photo_count_uuid,
        "Count",
        [],
        if_count_gt_zero_else(video_count_uuid, "Count", [], [kim_notify(msg)]),
    )


def if_count_gt_zero_else(
    count_uuid: str,
    count_name: str,
    then_actions: list,
    else_actions: list,
):
    group_id = uid()
    return [
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 0,
                "WFInput": variable_ref(count_uuid, count_name, coercion="WFNumberContentItem"),
                "WFCondition": 2,
                "WFNumberValue": "0",
            },
        },
        *then_actions,
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 1,
            },
        },
        *else_actions,
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 2,
            },
        },
    ]


def if_count_gt_zero(count_uuid: str, group_id: str, body_actions: list):
    block = [
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 0,
                "WFInput": variable_ref(count_uuid, "Count", coercion="WFNumberContentItem"),
                "WFCondition": 2,
                "WFNumberValue": "0",
            },
        }
    ]
    block.extend(body_actions)
    block.append(
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 2,
            },
        }
    )
    return block


def split_save_block(
    photos_ref: dict,
    *,
    service: str,
    destination_label: str = "",
):
    """Filter photos/videos and save to configured destination."""
    filter_photos_uuid = uid()
    filter_videos_uuid = uid()
    count_photos_uuid = uid()
    count_videos_uuid = uid()

    photos_filtered_ref = action_ref(filter_photos_uuid, "선택사진")
    videos_filtered_ref = action_ref(filter_videos_uuid, "선택동영상")

    actions = [
        media_filter("Image", photos_ref, "선택사진", filter_photos_uuid),
        media_filter("Video", photos_ref, "선택동영상", filter_videos_uuid),
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.count",
            "WFWorkflowActionParameters": {
                "UUID": count_photos_uuid,
                "WFCountType": "Items",
                "Input": photos_filtered_ref,
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.count",
            "WFWorkflowActionParameters": {
                "UUID": count_videos_uuid,
                "WFCountType": "Items",
                "Input": videos_filtered_ref,
            },
        },
    ]

    actions.extend(
        if_count_gt_zero(
            count_photos_uuid,
            uid(),
            [
                save_file(photos_filtered_ref, subpath="맛집 리스트/사진", service=service)
            ],
        )
    )
    actions.extend(
        if_count_gt_zero(
            count_videos_uuid,
            uid(),
            [
                save_file(videos_filtered_ref, subpath="맛집 리스트/비디오", service=service)
            ],
        )
    )
    if destination_label:
        actions.extend(
            if_no_media_to_save(count_photos_uuid, count_videos_uuid, destination_label)
        )
    return actions


def if_repeat_item_equals(text: str, group_id: str, body_actions: list):
    block = [
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 0,
                "WFInput": repeat_item_ref(),
                "WFCondition": 4,
                "WFConditionalActionString": text,
            },
        }
    ]
    block.extend(body_actions)
    block.append(
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 2,
            },
        }
    )
    return block


def destination_list(list_uuid: str, items: list[str]):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.list",
        "WFWorkflowActionParameters": {
            "UUID": list_uuid,
            "WFItems": items,
        },
    }


def choose_destinations(choose_uuid: str, list_uuid: str):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.choosefromlist",
        "WFWorkflowActionParameters": {
            "UUID": choose_uuid,
            "WFInput": action_ref(list_uuid, "List"),
            "WFChooseFromListActionSelectMultiple": True,
            "WFChooseFromListActionSelectAll": False,
            "WFChooseFromListActionPrompt": "어디로 보낼까요? (여러 개 선택 가능)",
        },
    }


def repeat_each_start(repeat_gid: str, choose_uuid: str):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.repeat.each",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "GroupingIdentifier": repeat_gid,
            "WFControlFlowMode": 0,
            "WFInput": action_ref(choose_uuid, "Chosen Item"),
        },
    }


def repeat_each_end(repeat_gid: str):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.repeat.each",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "GroupingIdentifier": repeat_gid,
            "WFControlFlowMode": 2,
        },
    }


def alert(title: str, message: str):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.alert",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "WFAlertActionTitle": title,
            "WFAlertActionMessage": {
                "Value": {"string": message, "attachmentsByRange": {}},
                "WFSerializationType": "WFTextTokenString",
            },
            "WFAlertActionCancelButtonShown": False,
        },
    }


def build():
    photos_uuid = uid()
    photos_ref = action_ref(photos_uuid, "Photos")
    photos_count_uuid = uid()
    list_uuid = uid()
    choose_uuid = uid()
    chosen_count_uuid = uid()
    repeat_gid = uid()

    kakao = "카카오톡 나에게 보내기"
    drive = "Google Drive"
    iphone = "내 iPhone"
    destinations = [kakao, drive, iphone]

    after_photos_selected = [
        destination_list(list_uuid, destinations),
        choose_destinations(choose_uuid, list_uuid),
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.count",
            "WFWorkflowActionParameters": {
                "UUID": chosen_count_uuid,
                "WFCountType": "Items",
                "Input": action_ref(choose_uuid, "Chosen Item"),
            },
        },
        *if_count_gt_zero_else(
            chosen_count_uuid,
            "Count",
            [
                repeat_each_start(repeat_gid, choose_uuid),
                *if_repeat_item_equals(
                    kakao,
                    uid(),
                    [
                        {
                            "WFWorkflowActionIdentifier": "is.workflow.actions.share",
                            "WFWorkflowActionParameters": {
                                "UUID": uid(),
                                "WFInput": photos_ref,
                            },
                        }
                    ],
                ),
                *if_repeat_item_equals(
                    drive,
                    uid(),
                    split_save_block(
                        photos_ref,
                        service="Google Drive",
                        destination_label="Google Drive",
                    ),
                ),
                *if_repeat_item_equals(
                    iphone,
                    uid(),
                    split_save_block(
                        photos_ref,
                        service="On My iPhone",
                        destination_label="내 iPhone",
                    ),
                ),
                repeat_each_end(repeat_gid),
                alert("완료", "선택한 곳으로 전송·저장했습니다."),
            ],
            [
                *kim_notify_fatal("보낼 곳을 하나 이상 선택해줘."),
            ],
        ),
    ]

    actions = [
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.comment",
            "WFWorkflowActionParameters": {
                "WFCommentActionText": (
                    "갤러리 전송 (단일 단축어)\n"
                    "오류 시 알림 제목: 김도훈\n"
                    "Drive · iPhone: 사진→맛집 리스트/사진, 동영상→맛집 리스트/비디오\n"
                    "※ 가져온 뒤 파일 저장 동작에서 폴더를 한 번씩 지정해야 자동 저장됨"
                ),
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.selectphoto",
            "WFWorkflowActionParameters": {
                "UUID": photos_uuid,
                "WFSelectMultiplePhotos": True,
            },
        },
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.count",
            "WFWorkflowActionParameters": {
                "UUID": photos_count_uuid,
                "WFCountType": "Items",
                "Input": photos_ref,
            },
        },
        *if_count_gt_zero_else(
            photos_count_uuid,
            "Count",
            after_photos_selected,
            [
                *kim_notify_fatal("사진이나 동영상을 선택하지 않았어."),
            ],
        ),
    ]

    return {
        "WFWorkflowActions": actions,
        "WFWorkflowClientRelease": "2.0",
        "WFWorkflowClientVersion": "900",
        "WFWorkflowMinimumClientVersion": 900,
        "WFWorkflowMinimumClientVersionString": "900",
        "WFWorkflowName": "갤러리 전송",
        "WFWorkflowImportQuestions": [],
        "WFWorkflowTypes": [],
        "WFWorkflowInputContentItemClasses": [],
        "WFWorkflowOutputContentItemClasses": [],
        "WFWorkflowIcon": {
            "WFWorkflowIconGlyphNumber": 59508,
            "WFWorkflowIconStartColor": 431817727,
        },
    }


def main():
    workflow = build()
    for path in (OUT, WORKSPACE_OUT, Path("/workspace/ios-shortcuts/gallery-transfer.shortcut")):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("wb") as f:
            plistlib.dump(workflow, f, fmt=plistlib.FMT_BINARY)
        print(f"Wrote {path} ({len(workflow['WFWorkflowActions'])} actions)")


if __name__ == "__main__":
    main()
