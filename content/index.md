---
title: Open Accelerator User Documentation
---

The Open Accelerator is a joint initiative of Red Hat, IBM (IBM Ventures), and the Commonwealth of Massachusetts (MA AI Hub). The new incubation initiative, based in Boston, is designed to empower the next generation of early-stage AI startups and bridge the "enterprise readiness gap" for entrepreneurs. [[via](https://www.redhat.com/en/blog/open-accelerator-joins-google-startups-cloud-program-empower-next-generation-innovators)]

## Available documentation

{% for page in collections.docs %}
- [{{page.data.title}}]({{page.url}})
{% endfor %}
