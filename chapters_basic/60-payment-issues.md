# Ch 60. Everyday Basic: Payment Issues

#### **1. Core Meaning**
"카드가 잘 안 긁히네요." (My card is not working.)
결제 순간에 카드가 작동하지 않으면 누구라도 당황하기 마련입니다. 단순히 `Error`라고 당황하기보다, 시스템의 결함인지 확인하거나 다른 결제 수단을 제안하며 품위를 유지하는 10가지 세련된 표현을 리팩토링해 보겠습니다.

#### **2. 10 Refactored Variations & Deep Analysis**

1. **"It seems my card is being declined. Could we try it again, please?"**
   *   **[직역/의역]:** 내 카드가 거절되고 있는 것처럼 보입니다. 다시 한번 시도해 볼 수 있을까요? / "카드가 승인이 안 나네요. 한 번만 다시 긁어주시겠어요?"
   *   **[Vocabulary & Nuance]:** **'declined'**는 결제가 거절되었다는 뜻의 정확한 금융 용어입니다. 내 카드의 문제라기보다 시스템의 일시적 오류인 것처럼 부드럽게 재시도를 요청하는 아주 세련된 방식입니다.

2. **"I'm sorry, the chip doesn't seem to be reading correctly. Do you have a contact-less option?"**
   *   **[직역/의역]:** 미안합니다, 칩이 올바르게 읽히지 않는 것 같습니다. 비접촉 결제 옵션이 있나요? / "칩 인식이 잘 안 되나 봐요. 혹시 카드를 갖다 대는 방식(컨택리스)으로도 되나요?"
   *   **[Vocabulary & Nuance]:** 결제 오류의 원인을 기술적으로 분석하여 제시합니다. **'contact-less'**는 카드를 긁거나 꽂지 않고 단말기에 대기만 하는 최신 결제 방식을 뜻하는 지적인 용어입니다.

3. **"Is your credit card machine down, or is it just my card?"**
   *   **[직역/의역]:** 당신들의 카드 기기가 내려갔나요(고장 났나요), 아니면 단지 내 카드가 그런 건가요? / "지금 카드 기계가 안 되는 건가요, 아니면 제 카드만 이런 건가요?"
   *   **[Vocabulary & Nuance]:** **'down'**은 시스템이 작동하지 않는다는 뜻의 아주 흔한 IT 용어입니다. 책임의 소재를 기계 탓으로 돌려보며 상황을 파악하는 영리한 질문입니다.

4. **"I apologize for the delay; let me try a different card instead."**
   *   **[직역/의역]:** 지연에 대해 사과합니다; 대신 다른 카드를 시도해 보겠습니다. / "늦어서 죄송해요. 다른 카드로 한번 해볼게요."
   *   **[Vocabulary & Nuance]:** 뒤에 기다리는 사람들을 배려하는 성숙한 고객의 모습입니다. 지체 없이 대안(**different card**)을 제시하여 상황을 신속히 해결하려는 의지를 보여줍니다.

5. **"Do you accept mobile payments like Apple Pay or Google Pay?"**
   *   **[직역/의역]:** 당신들은 애플페이나 구글페이 같은 모바일 결제를 수락합니까? / "혹시 애플페이나 구글페이도 되나요?"
   *   **[Vocabulary & Nuance]:** 실물 카드가 안 될 때 스마트폰을 활용한 대안을 묻는 현대적인 질문입니다. 지갑 없이도 결제 문제를 해결할 수 있는 스마트한 쇼퍼의 인상을 줍니다.

6. **"I'm having some trouble with the transaction. Is there an ATM nearby?"**
   *   **[직역/의역]:** 나는 거래와 관련하여 몇몇 문제를 겪고 있습니다. 근처에 ATM(현금인출기)이 있나요? / "결제가 잘 안 되네요. 근처에 현금 뽑을 데 있을까요?"
   *   **[Vocabulary & Nuance]:** **'transaction'**은 상업적 거래나 결제 과정을 뜻하는 격조 있는 단어입니다. 카드가 도저히 안 될 때 현금 결제라는 최후의 수단을 마련하기 위해 ATM의 위치를 묻는 실용적인 화법입니다.

7. **"The screen says 'authorization failed.' Could you check the system on your end?"**
   *   **[직역/의역]:** 화면에 '승인 실패'라고 나옵니다. 당신 쪽 시스템을 확인해 주실 수 있나요? / "화면에 승인 실패라고 뜨는데, 그쪽 시스템 한 번만 봐주시겠어요?"
   *   **[Vocabulary & Nuance]:** 단말기에 뜬 에러 메시지를 정확히 읽어주어 점원이 문제를 파악하게 도와줍니다. **'on your end'**는 "당신 쪽에서"라는 뜻의 아주 세련된 비즈니스 표현입니다.

8. **"I just used this card ten minutes ago, so it should be working fine."**
   *   **[직역/의역]:** 나는 단지 10분 전에 이 카드를 사용했습니다, 그러니 그것은 괜찮게 작동해야만 합니다. / "방금 전에도 썼던 카드라 잘 돼야 정상인데 이상하네요."
   *   **[Vocabulary & Nuance]:** 카드의 '신뢰성'을 입증하는 근거를 제시합니다. 내 계좌 잔고 문제가 아니라 기계적 오작동임을 넌지시 강조하여 자존심(?)을 지키는 방어 기제 표현입니다.

9. **"Could you hold my items for a moment? I need to call my bank to sort this out."**
   *   **[직역/의역]:** 내 아이템들을 잠시만 맡아주실 수 있나요? 나는 이것을 해결하기 위해 은행에 전화해야 합니다. / "이 물건들 잠깐만 맡아주세요. 은행에 전화해서 확인 좀 해보고 올게요."
   *   **[Vocabulary & Nuance]:** 문제를 회피하지 않고 직접 해결하려는 책임감 있는 태도입니다. **'sort this out'**은 엉킨 문제를 해결하다는 뜻의 아주 유용한 구어체 표현입니다.

10. **"Everything seems to be in order now. Thanks for your patience during the wait."**
    *   **[직역/의역]:** 모든 것이 이제 질서 안에 있는(정상인) 것처럼 보입니다. 기다리는 동안 당신의 인내심에 감사합니다. / "이제 제대로 됐네요. 기다려 주셔서 감사합니다."
   *   **[Vocabulary & Nuance]:** 문제가 해결된 뒤 뒷마무리를 짓는 우아한 인사입니다. **'in order'**는 모든 것이 정상화되었음을 뜻하며, 점원에게 고마움을 표함으로써 기분 좋게 쇼핑을 끝내는 고수들의 화법입니다.
