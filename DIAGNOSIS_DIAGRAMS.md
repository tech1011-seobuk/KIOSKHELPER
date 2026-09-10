# 포토이즘 헬퍼 · 진단 프로세스 다이어그램

이 문서는 조치 프로세스(증상별 단계·분기)를 다이어그램으로 보여줍니다.
깃허브에서 이 파일을 열면 자동으로 그림으로 렌더링됩니다.
수정하려면 오른쪽 위 연필(✏️) 아이콘을 눌러 텍스트를 고치고 저장하면 됩니다.

## 목차

- [💡 에스라이트](#에스라이트)
  - [ES-1 · 촬영 시 발광 안됨](#es-1)
  - [ES-2 · 자체 불빛이 안 들어옴](#es-2)
- [🔦 지속광](#지속광)
  - [CL-1 · 빠른 속도로 깜빡거림](#cl-1)
  - [CL-2 · 자체가 안 들어옴](#cl-2)
- [📷 카메라](#카메라)
  - [CAM-1 · 카메라 자체 에러코드 발생](#cam-1)
  - [CAM-2 · 촬영 도중 카메라 에러 문구 발생](#cam-2)
  - [CAM-3 · 촬영 직전 or 도중 카메라 통신오류 발생](#cam-3)
  - [CAM-4 · 고속 연사 촬영 되는 증상](#cam-4)
  - [CAM-5 · 촬영 시 저장 실패 문구 발생](#cam-5)
  - [CAM-6 · 촬영 화면 절반에 검은 사선 발생](#cam-6)
  - [CAM-7 · 초점이 잡히지 않는 증상](#cam-7)
  - [CAM-8 · 카메라 색감 이상](#cam-8)
- [🖥️ 모니터](#모니터)
  - [MON-1 · 화면 송출 자체가 안되는 증상](#mon-1)
  - [MON-2 · 화면 터치가 안되는 증상](#mon-2)
  - [MON-3 · 화면 송출이 비정상적인 증상](#mon-3)
- [🖨️ 프린터](#프린터)
  - [PRT-1 · 리본오류 문구 발생](#prt-1)
  - [PRT-2 · 헤드위치 오류 문구 발생](#prt-2)
  - [PRT-8 · 커터오류 문구 발생](#prt-8)
  - [PRT-3 · 전원 차단 문구 발생](#prt-3)
  - [PRT-4 · 냉각팬 오류 문구 발생](#prt-4)
  - [PRT-5 · 출력물에 얼룩/점 발생](#prt-5)
  - [PRT-6 · 소모품(인화지·리본) 구겨짐/끊어짐](#prt-6)
  - [PRT-7 · 사진 출력 시 QR이 안 나오는 증상](#prt-7)
  - [PRT-9 · 출력물 흰색 여백 발생](#prt-9)
  - [PRT-10 · 리본 끊어진 증상](#prt-10)
  - [PRT-11 · QR인식 불가](#prt-11)
  - [PRT-12 · QR코드 기간 만료](#prt-12)
  - [PRT-13 · QR코드 미출력](#prt-13)
  - [PRT-14 · QR코드 잘림](#prt-14)
- [💻 PC](#pc)
  - [PC-1 · 부팅이 안되는 증상](#pc-1)
  - [PC-2 · 블루스크린 발생](#pc-2)
  - [PC-3 · 용량 부족](#pc-3)
- [💳 카드리더기](#카드리더기)
  - [CR-1 · 카드 결제 실패](#cr-1)
  - [CR-2 · 카드 결제수단 선택불가](#cr-2)
- [💵 지폐투입기](#지폐투입기)
  - [BILL-1 · 지폐 투입 불가](#bill-1)
  - [BILL-3 · 지폐 투입은 되나 인식이 안되는 증상](#bill-3)
  - [BILL-4 · 지폐 or 카드 걸림](#bill-4)
- [🎮 리모컨 / 서비스코인 / 설정](#리모컨--서비스코인--설정)
  - [RC-1 · 리모컨 작동 불가](#rc-1)
  - [RC-2 · 서비스코인/설정버튼 작동 불가](#rc-2)
- [🛰️ CMS](#cms)
  - [CMS-1 · CMS 잔여용지가 -1로 표시됨](#cms-1)
- [🪙 서비스코인](#서비스코인)
  - [SNAP-COIN-1 · 서비스코인/설정버튼 작동 불가](#snap-coin-1)

---


## 💡 에스라이트


### ES-1 · 촬영 시 발광 안됨

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["에스라이트 조절 다이얼을 손가락으로<br/>눌러보았을 때 (수동으로) 발광이 될까요?"]
  n2a["발광이 된다면 에스라이트 자체는 문제가<br/>없고, 카메라와 에스라이트를 이어주는 핫슈<br/>또는 핫슈 케이블 문제입니다. 핫슈 재접촉<br/>후에도 동일할까요?"]
  n3a["핫슈 자체의 문제이거나 핫슈 케이블의 문제일<br/>수 있어요! 일단 핫슈를 먼저 교체<br/>진행해볼까요? 여분의 핫슈가 없다면 다른<br/>부스의 핫슈를 잠시 가져와서 교체 테스트<br/>해봐도 됩니다."]
  n4a["핫슈의 문제는 아닌 것 같아요! 핫슈<br/>케이블의 연결 문제인 것 같은데, 핫슈<br/>케이블 재접촉 해볼 수 있을까요?"]
  n5a["케이블의 불량인 것 같네요..! 케이블 교체<br/>해볼 수 있을까요? 여분의 케이블이<br/>없으시다면 다른 부스의 케이블을 가져와 교체<br/>테스트 부탁드립니다."]
  n1 -->|네| n2a
  END_AS(["🔧 A/S 필요"])
  n1 -->|아니오| END_AS
  NOTE_n1_1["📝 에스라이트 내부 부품의 문제로 수리가 필요합니다."]
  END_AS -.- NOTE_n1_1
  class NOTE_n1_1 noteNode
  n2a -->|동일합니다| n3a
  END_SOLVED(["✅ 해결"])
  n2a -->|해결되었습니다| END_SOLVED
  n3a -->|동일합니다| n4a
  n3a -->|해결되었습니다| END_SOLVED
  n4a -->|동일합니다| n5a
  n4a -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n5a -->|동일합니다| END_ESCALATE
  n5a -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### ES-2 · 자체 불빛이 안 들어옴

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["에스라이트 측면에 전원 스위치가 ㅡ 자에<br/>가있을까요? (ㅡ자 = 켜짐)"]
  nsw["전원 스위치를 ㅡ 자에 위치시켜주세요."]
  n2a["전원 스위치는 정상적으로 켜져 있군요!<br/>그렇다면 전원 케이블의 문제일 수 있습니다.<br/>전원 케이블이 꽂혀있는 에스라이트 쪽과<br/>반대편 멀티탭 쪽 재접촉 해봐주세요!"]
  n3a["멀티탭의 문제일 수 있습니다. 전원 케이블을<br/>다른 멀티탭 구로 이동시켜 꽂아볼 수<br/>있을까요?"]
  n4a["전원 케이블의 문제인 것 같네요, 전원<br/>케이블 교체하여 테스트 부탁드립니다! 이<br/>전원 케이블은 프린터 전원 케이블과 사양이<br/>동일합니다. 여분이 없다면 다른 부스의 전원<br/>케이블을 가져와 교체 테스트 부탁드립니다."]
  n1 -->|네| n2a
  n1 -->|아니오| nsw
  END_SOLVED(["✅ 해결"])
  nsw -->|해결되었습니다| END_SOLVED
  nsw -->|동일합니다| n2a
  n2a -->|동일합니다| n3a
  n2a -->|해결되었습니다| END_SOLVED
  n3a -->|동일합니다| n4a
  n3a -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n4a -->|동일합니다| END_AS
  NOTE_n4a_0["📝 전원 케이블 교체 시에도 해결되지 않는다면 에스라이트의<br/>문제입니다. 에스라이트 전원부의 문제로 A/S가<br/>필요합니다."]
  END_AS -.- NOTE_n4a_0
  class NOTE_n4a_0 noteNode
  n4a -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 🔦 지속광


### CL-1 · 빠른 속도로 깜빡거림

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["지속광 전원 케이블 재접촉 해볼 수<br/>있을까요? 지속광에 접촉된 연결부와 키오스크<br/>측면 멀티탭에 연결되어 있는 전원 케이블 두<br/>곳 모두 확인 부탁드립니다."]
  n2a["지속광 자체 문제 혹은 지속광 전원 케이블의<br/>자체 문제일 수 있습니다. 우선 지속광 전원<br/>케이블 먼저 교체 테스트 해볼 수 있을까요?<br/>여분의 지속광 전원 케이블이 없다면 다른<br/>부스의 전원 케이블을 가져와 교체 테스트<br/>해주시면 됩니다."]
  n3a["지속광 자체의 문제로 확인됩니다. 여분의<br/>지속광으로 교체 테스트 부탁드립니다. 여분이<br/>없다면 다른 부스의 지속광 하나만 떼와서<br/>교체 테스트 부탁드립니다."]
  n2b["해당 사진과 같이 기판에 접지되어 있는<br/>형태라면: 1) 키오스크 PC 전원을<br/>끈다 2) 키오스크 차단기를 내린다 3)<br/>드라이버를 이용하여 피스를 풀어 해당 +와-<br/>에 접지되어 있는 케이블을 뺐다가 다시<br/>조여준다 4) 역순으로 키오스크 전원 ON<br/>하여 상태 확인"]
  n3b["SMPS 기판의 문제일 확률이 큽니다.<br/>하지만 지속광 자체의 문제일 가능성도 배제할<br/>순 없어, 먼저 여분의 지속광으로 교체<br/>테스트 부탁드립니다. 만약 여분의 지속광이<br/>없다면 다른 부스의 지속광 하나만 떼와서<br/>교체 테스트 부탁드립니다."]
  n1 -->|동일합니다| n2a
  n1 -->|멀티탭에 꽂히는게 아니라 어떤 기판에 접지되어 있어요| n2b
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n2a -->|동일합니다| n3a
  n2a -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n3a -->|동일합니다| END_ESCALATE
  n3a -->|해결되었습니다| END_SOLVED
  n2b -->|동일합니다| n3b
  n2b -->|해결되었습니다| END_SOLVED
  n3b -->|동일합니다| END_ESCALATE
  NOTE_n3b_0["📝 SMPS 기판 문제로 추정됩니다."]
  END_ESCALATE -.- NOTE_n3b_0
  class NOTE_n3b_0 noteNode
  n3b -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CL-2 · 자체가 안 들어옴

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["지속광 전원 케이블 재접촉 해볼 수<br/>있을까요? 지속광에 접촉된 연결부와 키오스크<br/>측면 멀티탭에 연결되어 있는 전원 케이블 두<br/>곳 모두 확인 부탁드립니다."]
  n2a["지속광 자체 문제 혹은 지속광 전원 케이블의<br/>자체 문제일 수 있습니다. 우선 지속광 전원<br/>케이블 먼저 교체 테스트 해볼 수 있을까요?<br/>여분의 지속광 전원 케이블이 없다면 다른<br/>부스의 전원 케이블을 가져와 교체 테스트<br/>해주시면 됩니다."]
  n3a["지속광 자체의 문제로 확인됩니다. 여분의<br/>지속광으로 교체 테스트 부탁드립니다. 여분이<br/>없다면 다른 부스의 지속광 하나만 떼와서<br/>교체 테스트 부탁드립니다."]
  n2b["해당 사진과 같이 기판에 접지되어 있는<br/>형태라면: 1) 키오스크 PC 전원을<br/>끈다 2) 키오스크 차단기를 내린다 3)<br/>드라이버를 이용하여 피스를 풀어 해당 +와-<br/>에 접지되어 있는 케이블을 뺐다가 다시<br/>조여준다 4) 역순으로 키오스크 전원 ON<br/>하여 상태 확인"]
  n3b["SMPS 기판의 문제일 확률이 큽니다.<br/>하지만 지속광 자체의 문제일 가능성도 배제할<br/>순 없어, 먼저 여분의 지속광으로 교체<br/>테스트 부탁드립니다. 만약 여분의 지속광이<br/>없다면 다른 부스의 지속광 하나만 떼와서<br/>교체 테스트 부탁드립니다."]
  n1 -->|동일합니다| n2a
  n1 -->|멀티탭에 꽂히는게 아니라 어떤 기판에 접지되어 있어요| n2b
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n2a -->|동일합니다| n3a
  n2a -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n3a -->|동일합니다| END_ESCALATE
  n3a -->|해결되었습니다| END_SOLVED
  n2b -->|동일합니다| n3b
  n2b -->|해결되었습니다| END_SOLVED
  n3b -->|동일합니다| END_ESCALATE
  NOTE_n3b_0["📝 SMPS 기판 문제로 추정됩니다."]
  END_ESCALATE -.- NOTE_n3b_0
  class NOTE_n3b_0 noteNode
  n3b -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 📷 카메라


### CAM-1 · 카메라 자체 에러코드 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["에러코드 몇 번일까요?"]
  n01["카메라 렌즈 간의 결합 불완전으로 렌즈<br/>재결합이 필요합니다."]
  n70["카메라 온도 문제입니다. 카메라 전원을 끈<br/>상태로 5~10분 정도 대기 후, 다시<br/>전원을 켜서 테스트해주세요."]
  n1 -->|에러코드 01| n01
  END_AS(["🔧 A/S 필요"])
  n1 -->|에러코드 20| END_AS
  NOTE_n1_1["📝 셔터박스, 미러박스 등 관련 오류로 인한 셔터 오작동<br/>상태입니다. (A/S 필요)"]
  END_AS -.- NOTE_n1_1
  class NOTE_n1_1 noteNode
  n1 -->|에러코드 30| END_AS
  NOTE_n1_2["📝 셔터박스, 미러박스 등 관련 오류로 인한 셔터 오작동<br/>상태입니다. (A/S 필요)"]
  END_AS -.- NOTE_n1_2
  class NOTE_n1_2 noteNode
  n1 -->|에러코드 70| n70
  n1 -->|에러코드 99| END_AS
  NOTE_n1_4["📝 기계부 구성 관련 오류입니다."]
  END_AS -.- NOTE_n1_4
  class NOTE_n1_4 noteNode
  END_ESCALATE(["📞 담당자 연결"])
  n01 -->|동일합니다| END_ESCALATE
  END_SOLVED(["✅ 해결"])
  n01 -->|해결되었습니다| END_SOLVED
  n70 -->|해결되었습니다| END_SOLVED
  n70 -->|동일합니다| END_AS
  NOTE_n70_1["📝 📎 A/S 매뉴얼 (전달 예정)"]
  END_AS -.- NOTE_n70_1
  class NOTE_n70_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CAM-2 · 촬영 도중 카메라 에러 문구 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["뒷문을 열어 카메라 전원이 들어와있는지<br/>확인해주세요 (아무것도 만지지 말고).<br/>카메라 화면이 꺼져있다면 메뉴 버튼을 눌러서<br/>전원이 들어오는지 확인해주세요."]
  n2a["카메라에 에러코드가 떠있을까요?"]
  n3a["기본세팅 확인 부탁드리고, 테더선 재접촉 후<br/>테스트 부탁드립니다."]
  n4a["테더선이 꽂힌 PC의 USB 포트를 다른<br/>곳으로 위치 이동시켜서 꽂은 후 다시<br/>테스트해주세요."]
  n5a["여분의 테더선으로 교체하여 테스트<br/>부탁드립니다. 여분의 테더선이 없다면 다른<br/>부스의 테더선을 가지고 와 교체 테스트<br/>부탁드립니다."]
  n2b["더미배터리 재접촉 후 카메라 전원이<br/>들어오는지 확인 부탁드립니다. (카메라<br/>접촉부, 멀티탭 접촉부 2곳 모두)"]
  n3b["더미배터리 콘센트가 꽂힌 멀티탭의 위치를<br/>다른 곳으로 변경하여 꽂은 후 카메라 전원이<br/>들어오는지 확인 부탁드립니다."]
  n4b["더미배터리 교체 후 전원이 들어오는지 확인<br/>부탁드립니다."]
  n2c["에러코드 떠있을까요?"]
  n3c["촬영 테스트 부탁드립니다."]
  n1 -->|들어옴| n2a
  n1 -->|안 들어옴| n2b
  JUMP_n2a_0(["→ [CAM-1] 증상으로 이동"])
  n2a -->|예| JUMP_n2a_0
  class JUMP_n2a_0 jumpNode
  n2a -->|아니오| n3a
  n3a -->|동일합니다| n4a
  END_SOLVED(["✅ 해결"])
  n3a -->|해결되었습니다| END_SOLVED
  n4a -->|동일합니다| n5a
  n4a -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n5a -->|동일합니다| END_ESCALATE
  n5a -->|해결되었습니다| END_SOLVED
  n2b -->|전원 들어옵니다| n2c
  n2b -->|동일합니다| n3b
  n3b -->|전원 들어옵니다| n2c
  n3b -->|동일합니다| n4b
  n4b -->|전원 들어옵니다| n2c
  n4b -->|동일합니다| END_ESCALATE
  JUMP_n2c_0(["→ [CAM-1] 증상으로 이동"])
  n2c -->|예| JUMP_n2c_0
  class JUMP_n2c_0 jumpNode
  n2c -->|아니오| n3c
  n3c -->|해결되었습니다| END_SOLVED
  n3c -->|동일합니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CAM-3 · 촬영 직전 or 도중 카메라 통신오류 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["카메라 전원이 들어와있는지 확인해주세요<br/>(아무것도 만지지 말고). 화면이 꺼져있다면<br/>메뉴 버튼을 눌러서 전원이 들어오는지<br/>확인해주세요."]
  n2a["테더선 재접촉 후 테스트 부탁드립니다."]
  n3a["테더선이 꽂힌 PC의 USB 포트를 다른<br/>곳으로 위치 이동시켜서 꽂은 후 다시<br/>테스트해주세요."]
  n4a["여분의 테더선으로 교체하여 테스트<br/>부탁드립니다. 여분이 없다면 다른 부스의<br/>테더선을 가지고 와 교체 테스트<br/>부탁드립니다."]
  n2b["더미배터리 재접촉 (카메라측+멀티탭측) 후<br/>전원이 들어오는지 확인 부탁드립니다."]
  n3b["통신 테스트 부탁드립니다."]
  n4b["멀티탭 위치 변경 후 확인 부탁드립니다."]
  n5b["더미배터리 교체 후 확인 부탁드립니다."]
  n1 -->|들어옴| n2a
  n1 -->|안 들어옴| n2b
  n2a -->|동일합니다| n3a
  END_SOLVED(["✅ 해결"])
  n2a -->|해결되었습니다| END_SOLVED
  n3a -->|동일합니다| n4a
  n3a -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n4a -->|동일합니다| END_ESCALATE
  n4a -->|해결되었습니다| END_SOLVED
  n2b -->|전원 들어옵니다| n3b
  n2b -->|동일합니다| n4b
  n3b -->|해결되었습니다| END_SOLVED
  n3b -->|동일합니다| n4b
  n4b -->|전원 들어옵니다| n3b
  n4b -->|동일합니다| n5b
  n5b -->|전원 들어옵니다| n3b
  n5b -->|동일합니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CAM-4 · 고속 연사 촬영 되는 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["해당 사진과 같이 매수 촬영을 1매 촬영으로<br/>변경해주세요."]
  END_INFO(["info"])
  n1 -->|확인했습니다| END_INFO
  NOTE_n1_0["📝 설정값 조정으로 안내가 종료됩니다."]
  END_INFO -.- NOTE_n1_0
  class NOTE_n1_0 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CAM-5 · 촬영 시 저장 실패 문구 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["카메라 초점이 흐린가요?"]
  n2a["렌즈와 아크릴을 마른천으로 잘 닦아주시고,<br/>초점 모드가 AF로 되어 있는지 확인<br/>부탁드립니다. 렌즈, 바디 재결합도<br/>진행해주세요."]
  n1 -->|예| n2a
  JUMP_n1_1(["→ [CAM-2] 증상으로 이동"])
  n1 -->|아니오| JUMP_n1_1
  class JUMP_n1_1 jumpNode
  END_ESCALATE(["📞 담당자 연결"])
  n2a -->|동일합니다| END_ESCALATE
  END_SOLVED(["✅ 해결"])
  n2a -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CAM-6 · 촬영 화면 절반에 검은 사선 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["셔터박스 불량으로 인한 검은줄 증상으로<br/>A/S가 필요합니다."]
  END_AS(["🔧 A/S 필요"])
  n1 -->|확인했습니다| END_AS
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CAM-7 · 초점이 잡히지 않는 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["렌즈와 아크릴을 마른천으로 잘 닦아주시고,<br/>초점 모드가 AF로 되어 있는지 확인<br/>부탁드립니다. 렌즈, 바디 재결합도<br/>진행해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|동일합니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CAM-8 · 카메라 색감 이상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 🖥️ 모니터


### MON-1 · 화면 송출 자체가 안되는 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["화면 뒷편을 확인해보았을 때 초록 or 빨간<br/>LED가 들어와있을까요?"]
  n2a["모니터의 전원 자체는 문제 없으므로 HDMI<br/>재접촉 후 화면이 나오는지 확인 필요합니다."]
  n3a["HDMI 케이블 교체 이후 테스트<br/>부탁드립니다."]
  n2b["모니터 전원 어댑터에 LED가 들어와있는지<br/>확인 및 전원케이블 재접촉 필요합니다<br/>(모니터측 + 멀티탭측)."]
  n3b["전원 어댑터 + 전원 케이블 자체 교체가<br/>필요합니다."]
  n1 -->|예| n2a
  n1 -->|아니오| n2b
  n2a -->|동일합니다| n3a
  END_SOLVED(["✅ 해결"])
  n2a -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n3a -->|동일합니다| END_ESCALATE
  n3a -->|해결되었습니다| END_SOLVED
  n2b -->|동일합니다| n3b
  n2b -->|해결되었습니다| END_SOLVED
  n3b -->|동일합니다| END_ESCALATE
  n3b -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### MON-2 · 화면 터치가 안되는 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["모니터 뒷편 터치 케이블 재접촉 (모니터<br/>접촉부와 PC 접촉부 2곳) 후 테스트<br/>부탁드립니다."]
  n2["터치 케이블 교체 후 테스트 부탁드립니다.<br/>여분의 터치케이블이 없다면 프린터 AB<br/>케이블과 동일한 형태이므로 교체 테스트<br/>필요합니다."]
  n1 -->|동일합니다| n2
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n2 -->|동일합니다| END_AS
  NOTE_n2_0["📝 모니터 터치 패널 자체의 문제로 A/S가 필요합니다.<br/>여분의 모니터로 교체 부탁드립니다."]
  END_AS -.- NOTE_n2_0
  class NOTE_n2_0 noteNode
  n2 -->|교체가 불가한 타입의 모니터입니다| END_AS
  NOTE_n2_1["📝 모니터 자체 A/S가 필요합니다. 여분의 모니터로 교체<br/>부탁드립니다."]
  END_AS -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  n2 -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### MON-3 · 화면 송출이 비정상적인 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["HDMI 재접촉 후 테스트 부탁드립니다."]
  n2["HDMI 케이블 교체 후 테스트<br/>부탁드립니다."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n2 -->|동일합니다| END_AS
  NOTE_n2_1["📝 모니터 디스플레이 패널 자체 문제로 A/S가<br/>필요합니다."]
  END_AS -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 🖨️ 프린터


### PRT-1 · 리본오류 문구 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["1. 전원 차단 및 헤드 식히기: 프린터<br/>전원을 끄고 케이블을 분리한 후, 출력<br/>직후라면 헤드가 뜨거우니 5~10분간<br/>식혀주세요. 2. 커버 개방 및 소모품<br/>분리: 전면 커버를 열고 인화지, 리본을<br/>모두 제거해 먼지·지문·스크래치를<br/>확인합니다. 3. 감열 헤드 청소: 소독용<br/>알코올(이소프로필 90%↑)을 묻힌 세정펜<br/>또는 보풀 없는 면봉으로 헤드(발열체)<br/>부위를 한 방향으로 살살 문질러 닦습니다.<br/>⚠️ 금속·딱딱한 도구는 절대 사용하지<br/>마세요 (헤드 손상 시 영구 흰 선<br/>발생). 4. 롤러 청소: 인화지가 지나가는<br/>롤러를 알코올 솜으로 닦고, 손으로 돌려가며<br/>전체 면을 청소합니다. 5. 인화지 앞부분<br/>제거: 특정 자리에 반복적인 얼룩이 생긴다면<br/>인화지 롤 바깥쪽 30~50cm를 잘라내고<br/>재장착합니다. 6. 건조 및 재가동 테스트:<br/>알코올이 마를 때까지 1~2분 건조 후<br/>재조립, 전원을 켜고 테스트 출력해<br/>확인합니다."]
  n2["인화지, 리본을 새것으로 교체해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n2 -->|동일합니다| END_AS
  NOTE_n2_1["📝 📎 A/S 매뉴얼 (전달 예정)"]
  END_AS -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-2 · 헤드위치 오류 문구 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["1. 전원 차단 및 헤드 식히기: 프린터<br/>전원을 끄고 케이블을 분리한 후, 출력<br/>직후라면 헤드가 뜨거우니 5~10분간<br/>식혀주세요. 2. 커버 개방 및 소모품<br/>분리: 전면 커버를 열고 인화지, 리본을<br/>모두 제거해 먼지·지문·스크래치를<br/>확인합니다. 3. 감열 헤드 청소: 소독용<br/>알코올(이소프로필 90%↑)을 묻힌 세정펜<br/>또는 보풀 없는 면봉으로 헤드(발열체)<br/>부위를 한 방향으로 살살 문질러 닦습니다.<br/>⚠️ 금속·딱딱한 도구는 절대 사용하지<br/>마세요 (헤드 손상 시 영구 흰 선<br/>발생). 4. 롤러 청소: 인화지가 지나가는<br/>롤러를 알코올 솜으로 닦고, 손으로 돌려가며<br/>전체 면을 청소합니다. 5. 인화지 앞부분<br/>제거: 특정 자리에 반복적인 얼룩이 생긴다면<br/>인화지 롤 바깥쪽 30~50cm를 잘라내고<br/>재장착합니다. 6. 건조 및 재가동 테스트:<br/>알코올이 마를 때까지 1~2분 건조 후<br/>재조립, 전원을 켜고 테스트 출력해<br/>확인합니다."]
  n2["인화지, 리본을 새것으로 교체해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n2 -->|동일합니다| END_AS
  NOTE_n2_1["📝 📎 A/S 매뉴얼 (전달 예정)"]
  END_AS -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-8 · 커터오류 문구 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-3 · 전원 차단 문구 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["키오스크 앞문을 열어 프린터 전면부 LED가<br/>들어와있는지 확인 필요합니다."]
  n2a["프린터 AB 케이블 재접촉 후 테스트<br/>부탁드립니다."]
  n3a["AB 케이블이 꽂혀있는 PC의 USB 포트<br/>위치 변경 후 테스트 부탁드립니다."]
  n4a["AB 케이블 교체 후 테스트 부탁드립니다."]
  n2b["프린터 전원 케이블 재접촉 (프린터 부분과<br/>멀티탭 부분 2곳 모두) 후 테스트<br/>부탁드립니다."]
  n3b["전원 케이블이 꽂혀있는 멀티탭 위치 변경 후<br/>테스트 부탁드립니다."]
  n4b["전원 케이블 교체 후 테스트 부탁드립니다."]
  n1 -->|들어와있음| n2a
  n1 -->|안 들어와있음| n2b
  n2a -->|동일합니다| n3a
  END_SOLVED(["✅ 해결"])
  n2a -->|해결되었습니다| END_SOLVED
  n3a -->|동일합니다| n4a
  n3a -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n4a -->|동일합니다| END_ESCALATE
  n4a -->|해결되었습니다| END_SOLVED
  n2b -->|동일합니다| n3b
  n2b -->|해결되었습니다| END_SOLVED
  n3b -->|동일합니다| n4b
  n3b -->|해결되었습니다| END_SOLVED
  n4b -->|동일합니다| END_ESCALATE
  n4b -->|해결되었습니다| END_SOLVED
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-4 · 냉각팬 오류 문구 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["1. 전원 차단 및 헤드 식히기: 프린터<br/>전원을 끄고 케이블을 분리한 후, 출력<br/>직후라면 헤드가 뜨거우니 5~10분간<br/>식혀주세요. 2. 커버 개방 및 소모품<br/>분리: 전면 커버를 열고 인화지, 리본을<br/>모두 제거해 먼지·지문·스크래치를<br/>확인합니다. 3. 감열 헤드 청소: 소독용<br/>알코올(이소프로필 90%↑)을 묻힌 세정펜<br/>또는 보풀 없는 면봉으로 헤드(발열체)<br/>부위를 한 방향으로 살살 문질러 닦습니다.<br/>⚠️ 금속·딱딱한 도구는 절대 사용하지<br/>마세요 (헤드 손상 시 영구 흰 선<br/>발생). 4. 롤러 청소: 인화지가 지나가는<br/>롤러를 알코올 솜으로 닦고, 손으로 돌려가며<br/>전체 면을 청소합니다. 5. 인화지 앞부분<br/>제거: 특정 자리에 반복적인 얼룩이 생긴다면<br/>인화지 롤 바깥쪽 30~50cm를 잘라내고<br/>재장착합니다. 6. 건조 및 재가동 테스트:<br/>알코올이 마를 때까지 1~2분 건조 후<br/>재조립, 전원을 켜고 테스트 출력해<br/>확인합니다."]
  n2["인화지, 리본을 새것으로 교체해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n2 -->|동일합니다| END_AS
  NOTE_n2_1["📝 📎 A/S 매뉴얼 (전달 예정)"]
  END_AS -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-5 · 출력물에 얼룩/점 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["1. 전원 차단 및 헤드 식히기: 프린터<br/>전원을 끄고 케이블을 분리한 후, 출력<br/>직후라면 헤드가 뜨거우니 5~10분간<br/>식혀주세요. 2. 커버 개방 및 소모품<br/>분리: 전면 커버를 열고 인화지, 리본을<br/>모두 제거해 먼지·지문·스크래치를<br/>확인합니다. 3. 감열 헤드 청소: 소독용<br/>알코올(이소프로필 90%↑)을 묻힌 세정펜<br/>또는 보풀 없는 면봉으로 헤드(발열체)<br/>부위를 한 방향으로 살살 문질러 닦습니다.<br/>⚠️ 금속·딱딱한 도구는 절대 사용하지<br/>마세요 (헤드 손상 시 영구 흰 선<br/>발생). 4. 롤러 청소: 인화지가 지나가는<br/>롤러를 알코올 솜으로 닦고, 손으로 돌려가며<br/>전체 면을 청소합니다. 5. 인화지 앞부분<br/>제거: 특정 자리에 반복적인 얼룩이 생긴다면<br/>인화지 롤 바깥쪽 30~50cm를 잘라내고<br/>재장착합니다. 6. 건조 및 재가동 테스트:<br/>알코올이 마를 때까지 1~2분 건조 후<br/>재조립, 전원을 켜고 테스트 출력해<br/>확인합니다."]
  n2["인화지, 리본을 새것으로 교체해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n2 -->|동일합니다| END_AS
  NOTE_n2_1["📝 📎 A/S 매뉴얼 (전달 예정)"]
  END_AS -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-6 · 소모품(인화지·리본) 구겨짐/끊어짐

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["1. 전원 차단 및 헤드 식히기: 프린터<br/>전원을 끄고 케이블을 분리한 후, 출력<br/>직후라면 헤드가 뜨거우니 5~10분간<br/>식혀주세요. 2. 커버 개방 및 소모품<br/>분리: 전면 커버를 열고 인화지, 리본을<br/>모두 제거해 먼지·지문·스크래치를<br/>확인합니다. 3. 감열 헤드 청소: 소독용<br/>알코올(이소프로필 90%↑)을 묻힌 세정펜<br/>또는 보풀 없는 면봉으로 헤드(발열체)<br/>부위를 한 방향으로 살살 문질러 닦습니다.<br/>⚠️ 금속·딱딱한 도구는 절대 사용하지<br/>마세요 (헤드 손상 시 영구 흰 선<br/>발생). 4. 롤러 청소: 인화지가 지나가는<br/>롤러를 알코올 솜으로 닦고, 손으로 돌려가며<br/>전체 면을 청소합니다. 5. 인화지 앞부분<br/>제거: 특정 자리에 반복적인 얼룩이 생긴다면<br/>인화지 롤 바깥쪽 30~50cm를 잘라내고<br/>재장착합니다. 6. 건조 및 재가동 테스트:<br/>알코올이 마를 때까지 1~2분 건조 후<br/>재조립, 전원을 켜고 테스트 출력해<br/>확인합니다."]
  n2["인화지, 리본을 새것으로 교체해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n2 -->|동일합니다| END_AS
  NOTE_n2_1["📝 📎 A/S 매뉴얼 (전달 예정)"]
  END_AS -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-7 · 사진 출력 시 QR이 안 나오는 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["PC 부분 랜선과 매장 벽포트에 접촉되어<br/>있는 랜선, 두 곳 모두 재접촉 후 PC<br/>재부팅 및 테스트 부탁드립니다."]
  n2["랜선 교체 후 테스트 부탁드립니다."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n2 -->|동일합니다| END_ESCALATE
  NOTE_n2_1["📝 인터넷 기사를 호출하여 해당 부스의 인터넷 연결 상태<br/>확인이 필요합니다."]
  END_ESCALATE -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-9 · 출력물 흰색 여백 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-10 · 리본 끊어진 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-11 · QR인식 불가

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-12 · QR코드 기간 만료

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-13 · QR코드 미출력

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PRT-14 · QR코드 잘림

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 💻 PC


### PC-1 · 부팅이 안되는 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["PC 전원 케이블 재접촉 후 테스트<br/>부탁드립니다."]
  n2["PC 전원 스위치가 ㅡ 자에 향해 있나요?"]
  n3a["전원케이블이 꽂힌 멀티탭 위치 변경 후<br/>테스트 부탁드립니다."]
  n4["전원케이블 교체 후 테스트 부탁드립니다."]
  n3b["전원 스위치를 ㅡ 자로 위치시킨 후 테스트<br/>부탁드립니다."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|네| n3a
  n2 -->|아니오| n3b
  n3a -->|해결되었습니다| END_SOLVED
  n3a -->|동일합니다| n4
  n4 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n4 -->|동일합니다| END_AS
  NOTE_n4_1["📝 PC 내부 부품 문제로 A/S가 필요합니다."]
  END_AS -.- NOTE_n4_1
  class NOTE_n4_1 noteNode
  n3b -->|해결되었습니다| END_SOLVED
  n3b -->|동일합니다| n3a
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PC-2 · 블루스크린 발생

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["PC 재부팅 후 테스트 부탁드립니다."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  END_AS(["🔧 A/S 필요"])
  n1 -->|동일합니다| END_AS
  NOTE_n1_1["📝 📎 A/S 매뉴얼 (전달 예정)"]
  END_AS -.- NOTE_n1_1
  class NOTE_n1_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_AS fill:#3a1418,stroke:#e07a7a,color:#f2a3a3
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### PC-3 · 용량 부족

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 💳 카드리더기


### CR-1 · 카드 결제 실패

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["카드리더기 전면부에 LED가 들어와있을까요?"]
  n2a["카드리더기 전면부의 IC 칩을 제거 후 다시<br/>재장착해주세요."]
  n2b["PC에 접촉되어 있는 카드리더기 케이블을<br/>재접촉해주세요."]
  n1 -->|네| n2a
  n1 -->|아니오| n2b
  END_SOLVED(["✅ 해결"])
  n2a -->|해결되었습니다| END_SOLVED
  n2a -->|동일합니다| n2b
  n2b -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n2b -->|동일합니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### CR-2 · 카드 결제수단 선택불가

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["PC 부분 랜선과 매장 벽포트에 접촉되어<br/>있는 랜선, 두 곳 모두 재접촉 후 PC<br/>재부팅 및 테스트 부탁드립니다."]
  n2["랜선 교체 후 테스트 부탁드립니다."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n2 -->|동일합니다| END_ESCALATE
  NOTE_n2_1["📝 인터넷 기사를 호출하여 해당 부스의 인터넷 연결 상태<br/>확인이 필요합니다."]
  END_ESCALATE -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 💵 지폐투입기


### BILL-1 · 지폐 투입 불가

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["지폐투입기에 LED가 들어와있을까요?"]
  n2a["지폐투입기 상부 커버를 열었을 때 레일이<br/>돌아가면서 소리가 나나요?"]
  n3a["레일을 수동으로 돌려가면서 이물질이 있는지<br/>확인하고, 마른 천을 이용하여 청소 및<br/>테스트해주세요."]
  n2b["지폐투입기 측면에 있는 케이블과, 그<br/>반대쪽인 멀티탭과 PC 부분 or I/O<br/>보드 기판 부분을 재접촉 후 LED가<br/>들어오는지 확인해주세요."]
  n3b["지폐투입기 또는 지폐투입기 케이블을 교체하여<br/>테스트해주세요. 여분이 없다면 정상 작동하는<br/>부스의 지폐투입기 혹은 케이블을 가져와<br/>테스트해주세요. 교체 항목에 따라 조치되는<br/>것을 보고 어떤 것이 불량인지 확인해주세요."]
  n1 -->|네| n2a
  n1 -->|아니요| n2b
  END_ESCALATE(["📞 담당자 연결"])
  n2a -->|네| END_ESCALATE
  n2a -->|아니요| n3a
  END_SOLVED(["✅ 해결"])
  n3a -->|해결되었습니다| END_SOLVED
  n3a -->|동일합니다| END_ESCALATE
  n2b -->|해결되었습니다| END_SOLVED
  n2b -->|동일합니다| n3b
  n3b -->|지폐투입기 교체로 해결되었습니다| END_SOLVED
  NOTE_n3b_0["📝 지폐투입기 불량으로 확인되었습니다."]
  END_SOLVED -.- NOTE_n3b_0
  class NOTE_n3b_0 noteNode
  n3b -->|케이블 교체로 해결되었습니다| END_SOLVED
  NOTE_n3b_1["📝 케이블 불량으로 확인되었습니다."]
  END_SOLVED -.- NOTE_n3b_1
  class NOTE_n3b_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### BILL-3 · 지폐 투입은 되나 인식이 안되는 증상

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["투입은 정상이나 화면상 인식이 안 되는<br/>증상입니다."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### BILL-4 · 지폐 or 카드 걸림

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["이 증상에 대한 조치 방법은 곧 채워질<br/>예정이에요. 우선 담당자에게 문의해주세요."]
  END_ESCALATE(["📞 담당자 연결"])
  n1 -->|확인했습니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 🎮 리모컨 / 서비스코인 / 설정


### RC-1 · 리모컨 작동 불가

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["키오스크 뒷문을 열어 좌측을 보면 리모컨이<br/>빠져있는 구멍이 있습니다. 그 선을 따라가면<br/>체결부가 있는데, 거기 재접촉 해서<br/>작동되는지 테스트해주세요."]
  n2["이 키오스크는 I/O보드를 사용하는<br/>타입인가요?"]
  n3a["서비스코인, 설정버튼이 작동되나요?"]
  n4a["리모컨 교체 후 테스트해주세요."]
  n5a["리모컨 연장케이블 교체 후 테스트해주세요."]
  n3b["서비스코인, 설정버튼이 작동되나요?"]
  n4b["리모컨 교체 후 테스트해주세요."]
  n4c["PC에 꽂혀있는 USB 커넥터<br/>케이블(setting/coin 네임택)<br/>재접촉 후 테스트해주세요."]
  n5c["USB 커넥터 케이블 교체 후<br/>테스트해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|예, I/O보드형| n3a
  n2 -->|아니오, 최신형 (USB커넥터 통합)| n3b
  END_ESCALATE(["📞 담당자 연결"])
  n3a -->|작동 안 함| END_ESCALATE
  NOTE_n3a_0["📝 I/O보드 문제로 판단됩니다. TX팀 소통에 따라 조치<br/>방법을 안내받아야 합니다."]
  END_ESCALATE -.- NOTE_n3a_0
  class NOTE_n3a_0 noteNode
  n3a -->|작동함| n4a
  n4a -->|해결되었습니다| END_SOLVED
  n4a -->|동일합니다| n5a
  n5a -->|해결되었습니다| END_SOLVED
  n5a -->|동일합니다| END_ESCALATE
  n3b -->|작동함| n4b
  n3b -->|작동 안 함| n4c
  n4b -->|해결되었습니다| END_SOLVED
  n4b -->|동일합니다| END_ESCALATE
  n4c -->|해결되었습니다| END_SOLVED
  n4c -->|동일합니다| n5c
  n5c -->|해결되었습니다| END_SOLVED
  n5c -->|동일합니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


### RC-2 · 서비스코인/설정버튼 작동 불가

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["I/O보드 접촉부 쪽 케이블 재접촉 후<br/>테스트해주세요."]
  n2["이 키오스크는 I/O보드를 사용하는<br/>타입인가요?"]
  n3a["리모컨은 작동되나요?"]
  n4a["서비스코인/설정버튼 자체 교체는 어려우므로,<br/>USB 커넥터 케이블 방식으로 교체해주세요."]
  n3b["리모컨은 작동되나요?"]
  n4b["USB 커넥터 케이블(setting/coin<br/>네임택) 재접촉 후 테스트해주세요."]
  n5b["USB 커넥터 케이블 교체 후<br/>테스트해주세요."]
  n4c["USB 커넥터 케이블 재접촉 후<br/>테스트해주세요."]
  n5c["USB 커넥터 케이블 교체 후<br/>테스트해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|예, I/O보드형| n3a
  n2 -->|아니오, 최신형 (USB커넥터 통합)| n3b
  END_ESCALATE(["📞 담당자 연결"])
  n3a -->|작동 안 함| END_ESCALATE
  NOTE_n3a_0["📝 I/O보드 문제로 판단됩니다."]
  END_ESCALATE -.- NOTE_n3a_0
  class NOTE_n3a_0 noteNode
  n3a -->|작동함| n4a
  n4a -->|해결되었습니다| END_SOLVED
  n4a -->|동일합니다| END_ESCALATE
  n3b -->|작동함| n4b
  n3b -->|작동 안 함| n4c
  n4b -->|해결되었습니다| END_SOLVED
  n4b -->|동일합니다| n5b
  n5b -->|해결되었습니다| END_SOLVED
  n5b -->|동일합니다| END_ESCALATE
  n4c -->|해결되었습니다| END_SOLVED
  n4c -->|동일합니다| n5c
  n5c -->|해결되었습니다| END_SOLVED
  n5c -->|동일합니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 🛰️ CMS


### CMS-1 · CMS 잔여용지가 -1로 표시됨

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["PC 부분 랜선과 매장 벽포트에 접촉되어<br/>있는 랜선, 두 곳 모두 재접촉 후 PC<br/>재부팅 및 테스트 부탁드립니다."]
  n2["랜선 교체 후 테스트 부탁드립니다."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n2 -->|동일합니다| END_ESCALATE
  NOTE_n2_1["📝 인터넷 기사를 호출하여 해당 부스의 인터넷 연결 상태<br/>확인이 필요합니다."]
  END_ESCALATE -.- NOTE_n2_1
  class NOTE_n2_1 noteNode
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```


## 🪙 서비스코인


### SNAP-COIN-1 · 서비스코인/설정버튼 작동 불가

```mermaid
flowchart TD
  START(("시작")) --> n1
  n1["USB 커넥터 케이블(setting/coin<br/>네임택) 재접촉 후 테스트해주세요."]
  n2["USB 커넥터 케이블 교체 후<br/>테스트해주세요."]
  END_SOLVED(["✅ 해결"])
  n1 -->|해결되었습니다| END_SOLVED
  n1 -->|동일합니다| n2
  n2 -->|해결되었습니다| END_SOLVED
  END_ESCALATE(["📞 담당자 연결"])
  n2 -->|동일합니다| END_ESCALATE
  classDef default fill:#2c2f38,stroke:#5a5d68,color:#f2ead9,stroke-width:1px
  classDef jumpNode fill:#3a3d1c,stroke:#d7e632,color:#d7e632
  classDef noteNode fill:#22262e,stroke:#4a4d57,color:#9aa0ac,font-style:italic
  style END_SOLVED fill:#1c3a24,stroke:#4caf50,color:#8ee29a
  style END_ESCALATE fill:#3a2a14,stroke:#e0a256,color:#f0c98a
  style START fill:#d7e632,stroke:#d7e632,color:#1f1f23
```
