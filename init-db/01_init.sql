-- ─────────────────────────────────────────────────────
--  근육캐치 DB 초기화 (MariaDB)
--  docker compose up 시 자동 실행
-- ─────────────────────────────────────────────────────

-- DB 생성
CREATE DATABASE IF NOT EXISTS geunuk_auth    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS geunuk_product CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS geunuk_order   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS geunuk_point   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS geunuk_review  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 권한 부여
GRANT ALL PRIVILEGES ON geunuk_auth.*    TO 'geunuk'@'%';
GRANT ALL PRIVILEGES ON geunuk_product.* TO 'geunuk'@'%';
GRANT ALL PRIVILEGES ON geunuk_order.*   TO 'geunuk'@'%';
GRANT ALL PRIVILEGES ON geunuk_point.*   TO 'geunuk'@'%';
GRANT ALL PRIVILEGES ON geunuk_review.*  TO 'geunuk'@'%';
FLUSH PRIVILEGES;

-- ── geunuk_auth ───────────────────────────────────────
USE geunuk_auth;

CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(200),
    name       VARCHAR(50)  NOT NULL,
    phone      VARCHAR(20),
    address    VARCHAR(300),
    role       ENUM('USER','ADMIN')  NOT NULL DEFAULT 'USER',
    status     ENUM('ACTIVE','SUSPENDED','WITHDRAWN')  NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT       NOT NULL,
    provider       ENUM('google')  NOT NULL,
    provider_id    VARCHAR(200) NOT NULL,
    provider_email VARCHAR(100),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_provider (provider, provider_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 테스트 유저 (비밀번호: password123!)
INSERT IGNORE INTO users (email, password, name, phone, address, role, status)
VALUES ('test@geunuk.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lL6S', '테스트유저', '010-1234-5678', '서울시 강남구', 'USER', 'ACTIVE');

-- ── geunuk_product ────────────────────────────────────
USE geunuk_product;

CREATE TABLE IF NOT EXISTS products (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    brand        VARCHAR(100) NOT NULL,
    description  TEXT,
    price        DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock        INT          NOT NULL DEFAULT 0,
    category     VARCHAR(50)  NOT NULL,
    image_url    VARCHAR(500),
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 샘플 상품 데이터
INSERT IGNORE INTO products (name, brand, description, price, original_price, stock, category, status) VALUES
('프리미엄 육각 덤벨 세트', 'GEUNUK',   '논슬립 그립, 고내구성 철제',  89000, 99000,  50, '덤벨/바벨',  'ACTIVE'),
('케틀벨 16kg 주철',        'IRONKING', '주철 소재, 내구성 탁월',      45000, NULL,    30, '덤벨/바벨',  'ACTIVE'),
('요가매트 TPE 6mm',         'FLEXMAT',  '친환경 TPE 소재',             38000, 48000,  100,'매트',       'ACTIVE'),
('바벨봉 + 원판 20kg 세트',  'POWERBAR', '올림픽 규격 바벨',           185000, NULL,   20, '덤벨/바벨',  'ACTIVE'),
('웨이트 트레이닝 장갑 M',   'GRIPMAX',  '논슬립 그립 강화',            25000, 35000,  80, '헬스장갑',   'ACTIVE'),
('폼롤러 33cm 고밀도',       'ROLLPRO',  '고밀도 EVA 폼',               18000, NULL,    60, '스트레칭',   'ACTIVE'),
('하체 강화 저항밴드 5종',   'FLEXBAND', '5단계 강도별 구성',           22000, 28000,  90, '스트레칭',   'ACTIVE'),
('플라이오 박스 60cm',       'JUMPBOX',  '안전한 착지면 설계',          95000, NULL,    15, '기타',       'ACTIVE'),
('프로틴 쉐이커 700ml',      'SHAKEPRO', 'BPA Free 소재',               12000, 15000,  200,'보조제',     'ACTIVE'),
('인클라인 벤치 프레스',     'BENCHKING','각도 조절 7단계',            320000, 380000, 10, '기타',       'ACTIVE');

-- ── geunuk_order ──────────────────────────────────────
USE geunuk_order;

CREATE TABLE IF NOT EXISTS orders (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT        NOT NULL,
    total_price      DECIMAL(12,2) NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    receiver_name    VARCHAR(50)   NOT NULL,
    receiver_phone   VARCHAR(20)   NOT NULL,
    delivery_address VARCHAR(300)  NOT NULL,
    used_point       BIGINT        DEFAULT 0,
    created_at       DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    product_name VARCHAR(200)  NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ── geunuk_point ──────────────────────────────────────
USE geunuk_point;

CREATE TABLE IF NOT EXISTS point_balance (
    user_id    BIGINT   NOT NULL PRIMARY KEY,
    balance    BIGINT   NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS point_transactions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT      NOT NULL,
    amount        BIGINT      NOT NULL,
    balance_after BIGINT      NOT NULL,
    reason        VARCHAR(20) NOT NULL,
    reference_id  BIGINT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 테스트 유저 포인트 (user_id=1)
INSERT IGNORE INTO point_balance (user_id, balance) VALUES (1, 100000);
INSERT IGNORE INTO point_transactions (user_id, amount, balance_after, reason) VALUES (1, 100000, 100000, 'SIGN_UP');

-- ── geunuk_review ─────────────────────────────────────
USE geunuk_review;

CREATE TABLE IF NOT EXISTS reviews (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT       NOT NULL,
    user_id    BIGINT       NOT NULL,
    user_name  VARCHAR(50)  NOT NULL,
    rating     INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content    TEXT         NOT NULL,
    status     VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_review (product_id, user_id)
);

-- 샘플 리뷰
INSERT IGNORE INTO reviews (product_id, user_id, user_name, rating, content, status) VALUES
(1, 1, '김*수', 5, '정말 튼튼하고 그립감이 좋습니다. 배송도 빠르고 만족합니다!', 'ACTIVE'),
(3, 1, '이*진', 4, '품질은 좋은데 포장이 조금 아쉬웠어요. 상품 자체는 추천합니다.', 'ACTIVE');
