// domainClassifier.js
// Classifies AWS SAA-C03 questions into the 4 official exam domains using a
// keyword-based heuristic, and samples a weighted question set that mirrors the
// official domain distribution.

export const DOMAINS = {
  SECURE: {
    id: 'SECURE',
    number: 1,
    name: 'Design Secure Architectures',
    weight: 0.3,
  },
  RESILIENT: {
    id: 'RESILIENT',
    number: 2,
    name: 'Design Resilient Architectures',
    weight: 0.26,
  },
  HIGH_PERFORMING: {
    id: 'HIGH_PERFORMING',
    number: 3,
    name: 'Design High-Performing Architectures',
    weight: 0.24,
  },
  COST_OPTIMIZED: {
    id: 'COST_OPTIMIZED',
    number: 4,
    name: 'Design Cost-Optimized Architectures',
    weight: 0.2,
  },
};

export const DOMAIN_ORDER = [
  DOMAINS.SECURE,
  DOMAINS.RESILIENT,
  DOMAINS.HIGH_PERFORMING,
  DOMAINS.COST_OPTIMIZED,
];

// Weighted keyword lists. Each match adds `weight` points to that domain.
// More specific / distinctive keywords carry higher weights.
const DOMAIN_KEYWORDS = {
  SECURE: [
    ['iam', 3], ['identity and access management', 3], ['kms', 3], ['encryption', 2],
    ['encrypt', 2], ['security group', 3], ['nacl', 2], ['network acl', 3],
    ['secrets manager', 3], ['parameter store', 2], ['acm', 2], ['certificate manager', 2],
    ['waf', 3], ['shield', 3], ['guardduty', 3], ['macie', 3], ['inspector', 2],
    ['cognito', 3], ['sts', 2], ['assume role', 3], ['least privilege', 3],
    ['mfa', 3], ['bucket policy', 2], ['access key', 2], ['credentials', 2],
    ['ssl', 2], ['tls', 2], ['private key', 2], ['audit', 1], ['cloudtrail', 2],
    ['ddos', 2], ['firewall', 2], ['principal', 2], ['policy document', 2],
    ['authentication', 2], ['authorization', 2], ['permission', 2], ['iam role', 3],
    ['directory service', 2], ['active directory', 2], ['saml', 2],
  ],
  RESILIENT: [
    ['multi-az', 3], ['multi az', 3], ['auto scaling', 2], ['cross-region replication', 3],
    ['cross region replication', 3], ['high availability', 3], ['highly available', 3],
    ['fault tolerant', 3], ['fault-tolerant', 3], ['disaster recovery', 3], ['failover', 3],
    ['backup', 2], ['rto', 3], ['rpo', 3], ['route 53', 2], ['health check', 2],
    ['sqs', 2], ['sns', 2], ['decouple', 3], ['decoupling', 3], ['elastic load', 2],
    ['load balancer', 2], ['availability zone', 2], ['standby', 2], ['read replica', 2],
    ['snapshot', 1], ['resilient', 3], ['durable', 2], ['durability', 2],
    ['dead-letter', 2], ['dead letter', 2], ['redundancy', 2], ['redundant', 2],
    ['replicat', 2], ['recover', 2], ['self-healing', 2], ['aurora replica', 2],
  ],
  HIGH_PERFORMING: [
    ['cloudfront', 3], ['elasticache', 3], ['redis', 2], ['memcached', 2],
    ['ebs iops', 3], ['provisioned iops', 3], ['iops', 2], ['throughput', 2],
    ['latency', 2], ['performance', 2], ['caching', 2], ['cache', 2],
    ['global accelerator', 3], ['read performance', 2], ['dax', 3], ['fsx', 2],
    ['efs', 2], ['instance store', 2], ['placement group', 3], ['edge location', 2],
    ['compute optimized', 2], ['scaling policy', 2], ['scale out', 2], ['scale up', 2],
    ['kinesis', 2], ['athena', 2], ['redshift', 2], ['emr', 2], ['data transfer', 1],
    ['accelerate', 2], ['high performance', 3], ['low latency', 3], ['queue depth', 2],
    ['elastic file system', 2], ['transfer acceleration', 2], ['bandwidth', 2],
  ],
  COST_OPTIMIZED: [
    ['s3 lifecycle', 3], ['lifecycle policy', 3], ['lifecycle', 2], ['savings plan', 3],
    ['savings plans', 3], ['spot instance', 3], ['spot instances', 3], ['reserved instance', 3],
    ['reserved instances', 3], ['cost-effective', 3], ['cost effective', 3],
    ['most cost', 3], ['lowest cost', 3], ['minimize cost', 3], ['reduce cost', 3],
    ['cost optim', 3], ['glacier', 3], ['s3 standard-ia', 2], ['infrequent access', 2],
    ['intelligent-tiering', 3], ['intelligent tiering', 3], ['budget', 2],
    ['cost explorer', 3], ['on-demand', 1], ['pricing', 2], ['cheapest', 3],
    ['least expensive', 3], ['minimize the cost', 3], ['reduce the cost', 3],
    ['archive', 2], ['deep archive', 3], ['trusted advisor', 2], ['right-sizing', 2],
    ['operational overhead', 1], ['least operational', 1],
  ],
};

/**
 * Classify a single question into one of the 4 domains.
 * Uses an explicit `domain` field if present, otherwise a weighted keyword score.
 * Falls back to SECURE (highest weight) when no keywords match.
 */
export function classifyQuestion(question) {
  if (question.domain && DOMAINS[question.domain]) {
    return question.domain;
  }

  const text = `${question.question || ''} ${Object.values(question.choices || {}).join(' ')} ${
    question.explanation || ''
  }`.toLowerCase();

  const scores = {
    SECURE: 0,
    RESILIENT: 0,
    HIGH_PERFORMING: 0,
    COST_OPTIMIZED: 0,
  };

  for (const domainId of Object.keys(DOMAIN_KEYWORDS)) {
    for (const [keyword, weight] of DOMAIN_KEYWORDS[domainId]) {
      if (text.includes(keyword)) {
        scores[domainId] += weight;
      }
    }
  }

  // Pick the highest scoring domain. Deterministic tie-break by domain order.
  let best = null;
  let bestScore = -1;
  for (const domain of DOMAIN_ORDER) {
    if (scores[domain.id] > bestScore) {
      bestScore = scores[domain.id];
      best = domain.id;
    }
  }

  return bestScore > 0 ? best : DOMAINS.SECURE.id;
}

/**
 * Tag every question in a pool with a `domain` field (non-destructive copy).
 */
export function tagQuestions(pool) {
  return pool.map((q) => ({
    ...q,
    domain: classifyQuestion(q),
  }));
}

// Fisher-Yates shuffle (returns a new array).
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Compute how many questions each domain should contribute for a given total,
 * respecting the official weights. Uses largest-remainder to hit the exact total.
 */
export function computeDomainQuota(total) {
  const raw = DOMAIN_ORDER.map((d) => ({
    id: d.id,
    exact: total * d.weight,
    base: Math.floor(total * d.weight),
  }));

  let assigned = raw.reduce((sum, r) => sum + r.base, 0);
  let remaining = total - assigned;

  // Distribute the leftover to the domains with the largest fractional part.
  const byRemainder = [...raw].sort(
    (a, b) => (b.exact - b.base) - (a.exact - a.base)
  );
  let idx = 0;
  while (remaining > 0) {
    byRemainder[idx % byRemainder.length].base += 1;
    remaining -= 1;
    idx += 1;
  }

  const quota = {};
  raw.forEach((r) => {
    quota[r.id] = r.base;
  });
  return quota;
}

/**
 * Build a weighted exam set of `count` questions sampled from the tagged pool
 * according to the official domain distribution. If a domain lacks enough
 * questions, the shortfall is backfilled from remaining questions of any domain
 * so the requested count is always met (when the pool is large enough).
 */
export function sampleWeightedExam(taggedPool, count) {
  const quota = computeDomainQuota(count);

  const byDomain = {
    SECURE: [],
    RESILIENT: [],
    HIGH_PERFORMING: [],
    COST_OPTIMIZED: [],
  };
  taggedPool.forEach((q) => {
    (byDomain[q.domain] || byDomain.SECURE).push(q);
  });

  const selected = [];
  const usedNumbers = new Set();

  DOMAIN_ORDER.forEach((d) => {
    const need = quota[d.id];
    const shuffled = shuffle(byDomain[d.id]);
    const picked = shuffled.slice(0, need);
    picked.forEach((q) => {
      selected.push(q);
      usedNumbers.add(q.question_number);
    });
  });

  // Backfill if some domains were short on questions.
  if (selected.length < count) {
    const leftovers = shuffle(
      taggedPool.filter((q) => !usedNumbers.has(q.question_number))
    );
    for (const q of leftovers) {
      if (selected.length >= count) break;
      selected.push(q);
      usedNumbers.add(q.question_number);
    }
  }

  // Final shuffle so domains are interleaved like a real exam.
  return shuffle(selected).slice(0, count);
}

/**
 * Simple random sample (for practice mode without strict weighting).
 */
export function sampleRandom(taggedPool, count) {
  return shuffle(taggedPool).slice(0, count);
}
