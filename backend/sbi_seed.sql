BEGIN;

DELETE FROM tokens
WHERE service_queue_id IN (
    SELECT sq.id
    FROM service_queues sq
    JOIN branches b ON b.id = sq.branch_id
    JOIN organizations o ON o.id = b.org_id
    WHERE o.code = 'SBI'
);

UPDATE counters
SET current_agent_id = NULL,
    is_online = FALSE
WHERE branch_id IN (
    SELECT b.id
    FROM branches b
    JOIN organizations o ON o.id = b.org_id
    WHERE o.code = 'SBI'
);

DELETE FROM app_users
WHERE org_id IN (
    SELECT id FROM organizations WHERE code = 'SBI'
);

DELETE FROM service_queues
WHERE branch_id IN (
    SELECT b.id
    FROM branches b
    JOIN organizations o ON o.id = b.org_id
    WHERE o.code = 'SBI'
);

DELETE FROM counters
WHERE branch_id IN (
    SELECT b.id
    FROM branches b
    JOIN organizations o ON o.id = b.org_id
    WHERE o.code = 'SBI'
);

DELETE FROM departments
WHERE branch_id IN (
    SELECT b.id
    FROM branches b
    JOIN organizations o ON o.id = b.org_id
    WHERE o.code = 'SBI'
);

DELETE FROM branches
WHERE org_id IN (
    SELECT id FROM organizations WHERE code = 'SBI'
);

DELETE FROM organizations WHERE code = 'SBI';

WITH admin_hash AS (
    SELECT password AS hashed_password
    FROM app_users
    WHERE username = 'admin'
    LIMIT 1
), inserted_org AS (
    INSERT INTO organizations (name, code, contact_email, description)
    VALUES (
        'State Bank of India',
        'SBI',
        'support@sbi-demo.local',
        'Banking test organization for Smart Queue end-to-end validation.'
    )
    RETURNING id
), inserted_branches AS (
    INSERT INTO branches (name, location, timezone, support_email, contact_number, org_id)
    VALUES
        ('SBI Ashram Road Branch', 'Ahmedabad, Gujarat', 'Asia/Kolkata', 'ashramroad@sbi-demo.local', '+91-79-4000-1101', (SELECT id FROM inserted_org)),
        ('SBI Gandhinagar Branch', 'Gandhinagar, Gujarat', 'Asia/Kolkata', 'gandhinagar@sbi-demo.local', '+91-79-4000-2202', (SELECT id FROM inserted_org))
    RETURNING id, name, org_id
), inserted_departments AS (
    INSERT INTO departments (name, branch_id)
    VALUES
        ('Retail Banking', (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch')),
        ('Loans Desk', (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch')),
        ('Customer Service', (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch')),
        ('Cash Operations', (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch'))
    RETURNING id, name, branch_id
), inserted_queues AS (
    INSERT INTO service_queues (
        name, prefix, service_code, description, average_service_time_minutes,
        is_active, current_serving_token, last_generated_token, branch_id, department_id, current_token_sequence
    )
    VALUES
        ('Account Opening', 'A', 'AOP', 'Savings and current account onboarding queue.', 8, TRUE, 0, 0,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Retail Banking'), 0),
        ('Loan Consultation', 'L', 'LOAN', 'Home, education, and business loan guidance queue.', 12, TRUE, 0, 0,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Loans Desk'), 0),
        ('KYC And Passbook Update', 'K', 'KYC', 'KYC verification and passbook services.', 6, TRUE, 0, 0,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Customer Service'), 0),
        ('Cash Deposit And Withdrawal', 'C', 'CASH', 'Cash counter for deposits and withdrawals.', 4, TRUE, 0, 0,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Cash Operations'), 0)
    RETURNING id, name, branch_id, department_id
), inserted_counters AS (
    INSERT INTO counters (name, code, is_online, branch_id, department_id, current_agent_id)
    VALUES
        ('Retail Desk 1', 'SBI-RET-1', FALSE,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Retail Banking'), NULL),
        ('Loan Desk 1', 'SBI-LOAN-1', FALSE,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Loans Desk'), NULL),
        ('Service Desk 1', 'SBI-SVC-1', FALSE,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Customer Service'), NULL),
        ('Cash Counter 1', 'SBI-CASH-1', FALSE,
            (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch'),
            (SELECT id FROM inserted_departments WHERE name = 'Cash Operations'), NULL)
    RETURNING id, code, branch_id
), inserted_users AS (
    INSERT INTO app_users (
        username, password, full_name, email, phone, email_notifications_enabled, role, org_id, branch_id
    )
    VALUES
        ('sbiadmin', (SELECT hashed_password FROM admin_hash), 'SBI Organization Admin', 'sbiadmin@sbi-demo.local', '+91-90000-10001', TRUE, 'ORG_ADMIN',
            (SELECT id FROM inserted_org), NULL),
        ('sbiagent1', (SELECT hashed_password FROM admin_hash), 'SBI Retail Agent', 'sbiagent1@sbi-demo.local', '+91-90000-10011', TRUE, 'AGENT',
            (SELECT id FROM inserted_org), (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch')),
        ('sbiagent2', (SELECT hashed_password FROM admin_hash), 'SBI Loan Agent', 'sbiagent2@sbi-demo.local', '+91-90000-10012', TRUE, 'AGENT',
            (SELECT id FROM inserted_org), (SELECT id FROM inserted_branches WHERE name = 'SBI Ashram Road Branch')),
        ('sbiagent3', (SELECT hashed_password FROM admin_hash), 'SBI Service Agent', 'sbiagent3@sbi-demo.local', '+91-90000-10013', TRUE, 'AGENT',
            (SELECT id FROM inserted_org), (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch')),
        ('sbiagent4', (SELECT hashed_password FROM admin_hash), 'SBI Cash Agent', 'sbiagent4@sbi-demo.local', '+91-90000-10014', TRUE, 'AGENT',
            (SELECT id FROM inserted_org), (SELECT id FROM inserted_branches WHERE name = 'SBI Gandhinagar Branch'))
    RETURNING id, username
)
UPDATE counters c
SET current_agent_id = assigned.agent_id,
    is_online = TRUE
FROM (
    SELECT 'SBI-RET-1'::text AS counter_code, (SELECT id FROM inserted_users WHERE username = 'sbiagent1') AS agent_id
    UNION ALL
    SELECT 'SBI-LOAN-1', (SELECT id FROM inserted_users WHERE username = 'sbiagent2')
    UNION ALL
    SELECT 'SBI-SVC-1', (SELECT id FROM inserted_users WHERE username = 'sbiagent3')
    UNION ALL
    SELECT 'SBI-CASH-1', (SELECT id FROM inserted_users WHERE username = 'sbiagent4')
) assigned
WHERE c.code = assigned.counter_code;

COMMIT;

SELECT 'organization' AS entity, id::text AS ref, name AS label FROM organizations WHERE code = 'SBI'
UNION ALL
SELECT 'branch', id::text, name FROM branches WHERE org_id = (SELECT id FROM organizations WHERE code = 'SBI')
UNION ALL
SELECT 'agent', id::text, username FROM app_users WHERE org_id = (SELECT id FROM organizations WHERE code = 'SBI')
ORDER BY entity, label;
