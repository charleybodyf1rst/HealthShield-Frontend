# HealthShield Insurance Call Scripts

Reference scripts for inbound and outbound calls. Each script includes the opener, body, objection handlers, and close. Replace `{{variable}}` placeholders with the actual prospect/member details before reading.

---

## 1. Open Enrollment Outreach

**Type:** Cold outreach · **Category:** Sales · **Estimated duration:** 3 min

**Greeting (~15s):**

> Hi {{name}}, this is {{agent_name}} from HealthShield Insurance. I'm reaching out because Open Enrollment is currently underway, and I wanted to make sure you have a chance to review your health insurance options before the deadline. Do you have a couple of minutes?

**Body (~60s):**

> Great! This year we have some excellent plan options that might save you money or provide better coverage:
>
> - Individual and Family plans across Bronze, Silver, Gold, and Platinum tiers
> - Medicare Advantage plans with additional benefits
> - Dental & Vision add-ons
>
> Are you currently covered, or are you looking for new coverage this enrollment period?

**Objection bridge (~30s):**

> I understand — choosing health insurance can feel overwhelming. That's exactly why I'm here. I can do a quick comparison of your current plan against what's available and see if there's a better fit. It only takes about 10 minutes. Would that be helpful?

**Close (~15s):**

> I'd love to schedule a free plan comparison session. We can look at your current coverage and see if there are options that offer better value. Would {{suggested_time}} work, or is there a better time?

### Objection handlers

- **"I'm happy with my current plan."** — That's great to hear! Just so you know, plans change every year — premiums, networks, and benefits can shift. A quick review ensures you're still getting the best value. Would you like a no-obligation comparison?
- **"Too expensive."** — I hear you. That's actually a common concern, and many people are surprised to find they qualify for subsidies that significantly reduce their monthly premium. Can I check your eligibility?
- **"Too complicated."** — I completely understand. Insurance terminology can be confusing. My job is to simplify it for you. I'll walk you through everything in plain English. Sound good?

---

## 2. Medicare Advantage Comparison

**Type:** Cold outreach · **Category:** Sales · **Estimated duration:** 4 min

**Greeting (~15s):**

> Hello {{name}}, this is {{agent_name}} from HealthShield Insurance. I'm reaching out to Medicare beneficiaries in your area because we have some new Medicare Advantage plans that include additional benefits not covered by Original Medicare. Do you have a moment?

**Body (~90s):**

> Our Medicare Advantage plans this year include some great extras:
>
> - Dental, vision, and hearing coverage built in
> - Prescription drug coverage (Part D included)
> - Fitness and wellness programs
> - Telehealth visits at no additional cost
> - Some plans have $0 monthly premiums
>
> Are you currently on Original Medicare, or do you already have a Medicare Advantage plan?

**Objection bridge (~30s):**

> That's a fair concern. Many people worry about changing their Medicare coverage. The good news is, I can do a side-by-side comparison showing exactly what you'd gain and what stays the same. Your doctors and medications are usually the top priority — I can verify network coverage for you.

**Close (~15s):**

> Let me schedule a personalized Medicare plan review for you. I'll pull together a comparison based on your doctors, prescriptions, and preferences. Would {{suggested_time}} work for a 20-minute call?

### Objection handlers

- **"I don't want to change."** — I totally understand. Change can feel risky with something as important as healthcare. The comparison is just to make sure you're not paying more than you need to. No pressure to switch — just information.
- **"Will my doctors still be covered?"** — That's the number one question I get. I can check your specific doctors against our plan networks before you make any decisions. Would you like me to do that?
- **"I already have a Medicare Supplement."** — Medicare Supplement plans are great for covering gaps. But Medicare Advantage plans often include extras like dental and vision that Supplement plans don't. It's worth comparing the total cost. Can I show you?

---

## 3. Benefits Verification Follow-Up

**Type:** Follow-up · **Category:** Service · **Estimated duration:** 2.5 min

**Greeting (~10s):**

> Hi {{name}}, this is {{agent_name}} from HealthShield Insurance. I'm following up on your recent benefits verification request. I have the coverage details ready for you. Is this a good time?

**Body (~60s):**

> I've reviewed your {{plan_name}} plan and here's what I found:
>
> - Your deductible status: {{deductible_status}}
> - Copay for the service you asked about: {{copay_amount}}
> - Prior authorization: {{auth_required}}
> - Network status of your provider: {{network_status}}
>
> Do you have any questions about these details?

**Close (~15s):**

> Is there anything else I can help you verify? I'm happy to check coverage for any other services or providers. Also, remember you can always check your benefits online through our member portal at healthshield.com.

### Objection handlers

- **"Coverage was denied."** — I understand that's frustrating. Let me explain the reason and what your options are. You may be able to request a prior authorization or get a referral from your PCP. Would you like me to start that process?
- **"My doctor is out of network."** — You still have out-of-network benefits, though the cost-share is different. I can also help you find an in-network provider nearby if you'd prefer. What would you like to do?

---

## 4. Claims Status Check-In

**Type:** Check-in · **Category:** Service · **Estimated duration:** 2 min

**Greeting (~10s):**

> Hi {{name}}, this is {{agent_name}} from HealthShield Insurance. I'm calling with an update on your recent claim. Do you have a moment?

**Body (~45s):**

> Your claim #{{claim_number}} has been {{claim_status}}. Here's a quick summary:
>
> - Service date: {{service_date}}
> - Total charged: {{total_charged}}
> - Plan paid: {{plan_paid}}
> - Your responsibility: {{member_responsibility}}
>
> Do you have any questions about this claim?

**Close (~15s):**

> If you have any concerns about this claim, you can request a detailed Explanation of Benefits through our portal, or I can transfer you to our claims specialist. Is there anything else I can help with today?

### Objection handlers

- **"Claim was denied."** — The denial was due to {{denial_reason}}. You have the right to appeal this decision within 180 days. Would you like me to start the appeals process or transfer you to a claims specialist?
- **"The amount seems wrong."** — Let me take a closer look at the claim details. Sometimes there are coordination-of-benefits issues or coding discrepancies. I'll flag this for review. Can you tell me what amount you were expecting?

---

## 5. Policy Renewal Reminder

**Type:** Follow-up · **Category:** Sales · **Estimated duration:** 3 min

**Greeting (~15s):**

> Hi {{name}}, this is {{agent_name}} from HealthShield Insurance. I'm reaching out because your {{plan_name}} policy is coming up for renewal on {{renewal_date}}. I wanted to make sure you have everything you need. Do you have a few minutes?

**Body (~60s):**

> For your upcoming renewal, here are a few things to know:
>
> - Your new premium will be {{new_premium}} per month
> - Your benefits structure {{benefits_change}}
> - You have the option to switch to a different tier if you'd like
>
> I can also do a quick comparison to see if another plan might be a better fit for next year. Would you like me to review your options?

**Close (~15s):**

> To renew, you can simply do nothing and your plan will auto-renew. But if you'd like to explore other options, let's schedule a plan review before {{renewal_date}}. When works best for you?

### Objection handlers

- **"Premium is too high."** — I understand the increase is frustrating. Let me check if you qualify for any subsidies or if switching tiers could save you money while keeping the coverage you need. Can I run a quick comparison?
- **"I want to cancel."** — I'm sorry to hear that. Before you cancel, may I ask what's driving the decision? There might be options I can offer — a different plan, payment assistance, or coverage adjustments. I'd hate for you to lose coverage unnecessarily.

---

## 6. Eligibility Screening

**Type:** Cold outreach · **Category:** Sales · **Estimated duration:** 4 min

**Greeting (~15s):**

> Hi {{name}}, this is {{agent_name}} from HealthShield Insurance. I see you started an application on our website. I'm calling to help you finish the process and check your eligibility for coverage and any available subsidies. Do you have about 10 minutes?

**Body (~120s):**

> To determine your eligibility and potential savings, I'll need to ask a few quick questions:
>
> 1. How many people in your household need coverage?
> 2. What's your approximate household income?
> 3. Are you currently covered by any insurance (employer, COBRA, etc.)?
> 4. Have you had any qualifying life events recently (marriage, birth, job loss)?
>
> Based on your answers, I can check for premium tax credits and cost-sharing reductions that could significantly lower your costs.

**Close (~15s):**

> Based on what you've told me, it looks like you {{eligibility_result}}. I'd like to walk you through the plan options that fit your situation. Would you like to continue now, or schedule a time to go through the plans in detail?

### Objection handlers

- **"I'm worried about privacy."** — I completely understand your concern about sharing personal information. All information is kept strictly confidential and is only used to determine your insurance eligibility. We're required by law to protect your data under HIPAA and state privacy regulations.
- **"I'm already covered."** — That's great that you have coverage. Many people check during enrollment to see if they can get a better deal. Would you like a quick comparison just to make sure you're getting the best value?
- **"I can't afford it."** — That's exactly why we check for subsidies. Many people are surprised to find they qualify for significant help. Based on household size and income, you might get a plan for much less than you think. Can I run the numbers?

---

## 7. New Member Onboarding

**Type:** Onboarding · **Category:** Service · **Estimated duration:** 5 min

**Greeting (~15s):**

> Hi {{name}}, this is {{agent_name}} from HealthShield Insurance. Welcome to HealthShield! I'm calling to make sure you're all set with your new {{plan_name}} coverage and to walk you through everything you need to know. Do you have about 10 minutes?

**Body (~120s):**

> Congratulations on your new plan! Here are the key things to know:
>
> - Your coverage start date is {{start_date}}
> - Your member ID card will arrive in 7-10 business days. In the meantime, you can access a digital card on our app
> - Your PCP is {{pcp_name}} — make sure to schedule your annual wellness visit
> - Your deductible is {{deductible_amount}} and copays start at {{copay_amount}}
>
> Have you downloaded our mobile app yet? It lets you find providers, check claims, and access your ID card instantly.

**Close (~15s):**

> I'll send you a welcome email with all these details plus a link to download our app. If you have any questions as you start using your plan, don't hesitate to call us. Is there anything else I can help you with today?

### Objection handlers

- **"I haven't picked a PCP yet."** — No problem! Selecting a primary care physician is important for getting the most out of your plan. I can help you find one in our network right now. What area do you live in, and do you have any preferences?
- **"I'm confused about how the plan works."** — Insurance can definitely be confusing at first. Let me break it down simply. Think of your deductible as the amount you pay before insurance kicks in for bigger services. Copays are flat fees for routine visits. Would you like me to go through a few common scenarios?

---

## 8. Dental & Vision Cross-Sell

**Type:** Follow-up · **Category:** Sales · **Estimated duration:** 2.5 min

**Greeting (~15s):**

> Hi {{name}}, this is {{agent_name}} from HealthShield Insurance. I'm reaching out to our valued members because we've recently enhanced our dental and vision plans. Since your current {{plan_name}} plan doesn't include dental or vision coverage, I thought you might be interested. Do you have a quick minute?

**Body (~60s):**

> Our dental and vision add-ons are designed to be affordable and easy to use:
>
> - Dental plans starting at just $18/month: two free cleanings per year, X-rays covered, 50-80% coverage on major work
> - Vision plans starting at $9/month: annual eye exam, $150 frame allowance, contact lens coverage
> - Bundle both for just $24/month with additional savings
>
> Preventive dental and vision care can actually catch health issues early — many systemic conditions show up in dental and eye exams first. Are you currently getting dental or vision care?

**Close (~15s):**

> Adding dental and vision to your existing plan is simple — it can be effective as early as next month with no waiting period for preventive services. Would you like me to add one or both to your plan?

### Objection handlers

- **"I already have dental."** — That's great you're covered! Do you mind if I ask who your dental plan is through? Sometimes we can offer better rates or a wider network. At the very least, it's worth a comparison.
- **"I don't go to the dentist."** — A lot of people skip dental visits. But preventive care is actually fully covered, and regular cleanings can prevent expensive problems down the road. The plan pays for itself with just two cleanings a year.
- **"Too expensive."** — Consider this: a single dental filling averages $200-300 out of pocket. Our plan at $18/month covers most of that. And preventive visits are free. It's really insurance against the unexpected.

---

## Tips for using these scripts

- **Don't read verbatim.** These are skeletons — let the prospect's tone guide your pacing and phrasing.
- **Variables in `{{double braces}}`** must be replaced before the call. Get the name + plan info from the CRM lead detail.
- **Pause after the greeting.** Wait for confirmation ("Yeah, what's this about?") before launching into the body. Talking over the prospect kills the call.
- **Handle one objection at a time.** Don't preempt — let them name their concern, then use the matching handler.
- **Always end with a clear next step:** scheduled call, follow-up time, or "I'll email you the details." Never end on "Let me know."
