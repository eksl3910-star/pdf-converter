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
    subpath: str | None = None,
    ask_where: bool = False,
    service: str | None = None,
):
    params = {
        "UUID": uid(),
        "WFInput": input_ref,
        "WFAskWhereToSave": ask_where,
        "WFSaveFileOverwrite": True,
    }
    if service:
        params["WFFileStorageService"] = service
    if subpath and not ask_where:
        params["WFFileDestinationPath"] = {
            "Value": {"string": subpath, "attachmentsByRange": {}},
            "WFSerializationType": "WFTextTokenString",
        }
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.documentpicker.save",
        "WFWorkflowActionParameters": params,
    }


def if_count_gt_zero(count_uuid: str, group_id: str, body_actions: list):
    block = [
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.conditional",
            "WFWorkflowActionParameters": {
                "UUID": uid(),
                "GroupingIdentifier": group_id,
                "WFControlFlowMode": 0,
                "WFInput": action_ref(count_uuid, "Count"),
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
    photo_path: str | None,
    video_path: str | None,
    ask_where: bool,
    service: str | None,
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
                save_file(
                    photos_filtered_ref,
                    subpath=photo_path,
                    ask_where=ask_where,
                    service=service,
                )
            ],
        )
    )
    actions.extend(
        if_count_gt_zero(
            count_videos_uuid,
            uid(),
            [
                save_file(
                    videos_filtered_ref,
                    subpath=video_path,
                    ask_where=ask_where,
                    service=service,
                )
            ],
        )
    )
    return actions


def menu_start(group_id: str, items: list[str]):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.choosefrommenu",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "GroupingIdentifier": group_id,
            "WFControlFlowMode": 0,
            "WFMenuItems": [
                {
                    "WFItemType": 0,
                    "WFValue": {
                        "Value": {"string": title, "attachmentsByRange": {}},
                        "WFSerializationType": "WFTextTokenString",
                    },
                }
                for title in items
            ],
        },
    }


def menu_item(group_id: str, title: str):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.choosefrommenu",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "GroupingIdentifier": group_id,
            "WFControlFlowMode": 1,
            "WFMenuItemTitle": title,
        },
    }


def menu_end(group_id: str):
    return {
        "WFWorkflowActionIdentifier": "is.workflow.actions.choosefrommenu",
        "WFWorkflowActionParameters": {
            "UUID": uid(),
            "GroupingIdentifier": group_id,
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
    main_menu_gid = uid()

    actions = [
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.comment",
            "WFWorkflowActionParameters": {
                "WFCommentActionText": (
                    "갤러리 → 카카오톡 / Google Drive / 내 iPhone\n"
                    "Google Drive · 내 iPhone: 맛집 리스트/사진 · 동영상 자동 분류\n"
                    "※ Google Drive는 단축어 설치 후 파일 저장 위치를 Drive로 한 번만 지정"
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
        menu_start(
            main_menu_gid,
            [
                "카카오톡 나에게 보내기",
                "Google Drive",
                "내 iPhone",
            ],
        ),
        # 1) KakaoTalk
        menu_item(main_menu_gid, "카카오톡 나에게 보내기"),
        {
            "WFWorkflowActionIdentifier": "is.workflow.actions.share",
            "WFWorkflowActionParameters": {"UUID": uid(), "WFInput": photos_ref},
        },
        # 2) Google Drive — auto split into 맛집 리스트/사진 · 동영상 (no per-run folder pick)
        menu_item(main_menu_gid, "Google Drive"),
        *split_save_block(
            photos_ref,
            photo_path="맛집 리스트/사진",
            video_path="맛집 리스트/동영상",
            ask_where=False,
            service="Google Drive",
        ),
        alert(
            "Google Drive",
            "맛집 리스트 폴더에 사진·동영상을 나눠 저장했습니다.",
        ),
        # 3) On My iPhone
        menu_item(main_menu_gid, "내 iPhone"),
        *split_save_block(
            photos_ref,
            photo_path="맛집 리스트/사진",
            video_path="맛집 리스트/동영상",
            ask_where=False,
            service="On My iPhone",
        ),
        alert("저장 완료", "내 iPhone의 맛집 리스트 폴더에 저장했습니다."),
        menu_end(main_menu_gid),
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
    for path in (OUT, WORKSPACE_OUT):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("wb") as f:
            plistlib.dump(workflow, f, fmt=plistlib.FMT_BINARY)
        print(f"Wrote {path} ({len(workflow['WFWorkflowActions'])} actions)")


if __name__ == "__main__":
    main()
