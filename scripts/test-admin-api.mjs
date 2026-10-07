// Comprehensive Admin Functionality and API Test Suite
const BASE_URL = 'http://localhost:3001';

const results = [];

function recordTest(name, passed, details, error = null) {
  results.push({ name, passed, details, error: error ? String(error) : null });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}: ${details}`);
  if (error) console.error('  Error:', error);
}

async function runTests() {
  console.log('\n=============================================');
  console.log('--- STARTING ADMIN BACKEND API TEST SUITE ---');
  console.log('=============================================\n');

  // Test 1: Admin Login with incorrect password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrongpassword123' })
    });
    const data = await res.json();
    if (res.status === 401 && data.error) {
      recordTest('Admin Login (Wrong Password)', true, `Correctly rejected with 401: "${data.error}"`);
    } else {
      recordTest('Admin Login (Wrong Password)', false, `Unexpected response status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Admin Login (Wrong Password)', false, 'Request failed', err);
  }

  // Test 2: Admin Login with empty password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '' })
    });
    const data = await res.json();
    if (res.status === 400) {
      recordTest('Admin Login (Empty Password)', true, `Correctly rejected with 400: "${data.error}"`);
    } else {
      recordTest('Admin Login (Empty Password)', false, `Unexpected response status ${res.status}`);
    }
  } catch (err) {
    recordTest('Admin Login (Empty Password)', false, 'Request failed', err);
  }

  // Test 3: Admin Login with valid configured password ('DS2026')
  let authToken = null;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'DS2026' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token) {
      authToken = data.token;
      recordTest('Admin Login (Valid Password DS2026)', true, `Authentication successful, received token: ${data.token.slice(0, 16)}...`);
    } else {
      recordTest('Admin Login (Valid Password DS2026)', false, `Failed to authenticate: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Admin Login (Valid Password DS2026)', false, 'Request failed', err);
  }

  // Test 4: System Diagnostics Health Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/system/health`);
    const data = await res.json();
    if (res.ok && data.status === 'operational' && data.memory && data.envStatus) {
      recordTest('System Health Diagnostics API', true, `Status: ${data.status}, Uptime: ${data.uptimeSeconds}s, Heap: ${data.memory.heapUsedMB}MB, Achievements Count: ${data.database?.achievementsCount}`);
    } else {
      recordTest('System Health Diagnostics API', false, `Invalid response: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('System Health Diagnostics API', false, 'Request failed', err);
  }

  // Test 5: Get Achievements List
  let initialAchievementCount = 0;
  try {
    const res = await fetch(`${BASE_URL}/api/achievements`);
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      initialAchievementCount = data.length;
      recordTest('Achievements - Fetch All', true, `Retrieved ${data.length} achievements`);
    } else {
      recordTest('Achievements - Fetch All', false, `Failed to retrieve achievements: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Achievements - Fetch All', false, 'Request failed', err);
  }

  // Test 6: Create New Achievement
  const testId = `test_achieve_${Date.now()}`;
  try {
    const newCard = {
      id: testId,
      title: 'Automated Test Achievement',
      issuer: 'Admin Test Suite',
      category: 'certification',
      date: '2026',
      description: 'Temporary achievement created by automated verification suite.',
      skills: ['Testing', 'Automation'],
      iconType: 'trophy',
      level: 'Specialist',
      featured: true
    };

    const res = await fetch(`${BASE_URL}/api/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard)
    });
    const data = await res.json();
    if (res.ok && data.success && data.achievement?.id === testId) {
      recordTest('Achievements - Create Achievement', true, `Successfully created achievement with id: ${testId}`);
    } else {
      recordTest('Achievements - Create Achievement', false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Achievements - Create Achievement', false, 'Request failed', err);
  }

  // Test 7: Update Achievement
  try {
    const updatePayload = {
      title: 'Automated Test Achievement (Updated)',
      description: 'Updated description for test verification.'
    };
    const res = await fetch(`${BASE_URL}/api/achievements/${testId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const data = await res.json();
    if (res.ok && data.success && data.achievement?.title === 'Automated Test Achievement (Updated)') {
      recordTest('Achievements - Update Achievement', true, `Successfully updated achievement title to "${data.achievement.title}"`);
    } else {
      recordTest('Achievements - Update Achievement', false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Achievements - Update Achievement', false, 'Request failed', err);
  }

  // Test 8: Delete Achievement
  try {
    const res = await fetch(`${BASE_URL}/api/achievements/${testId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (res.ok && data.success && data.remaining === initialAchievementCount) {
      recordTest('Achievements - Delete Achievement', true, `Successfully deleted test achievement, count returned to ${data.remaining}`);
    } else {
      recordTest('Achievements - Delete Achievement', false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Achievements - Delete Achievement', false, 'Request failed', err);
  }

  // Test 9: Portfolio Content - Fetch Content
  let originalContent = null;
  try {
    const res = await fetch(`${BASE_URL}/api/portfolio-content`);
    const data = await res.json();
    if (res.ok && data) {
      originalContent = data;
      recordTest('Portfolio Content - Fetch Content', true, `Successfully loaded portfolio content keys: ${Object.keys(data).join(', ')}`);
    } else {
      recordTest('Portfolio Content - Fetch Content', false, `Failed to load: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Portfolio Content - Fetch Content', false, 'Request failed', err);
  }

  // Test 10: Portfolio Content - Update Content (Deep Merge)
  try {
    const testUpdate = {
      hero: {
        adminTestKey: 'test_value_123'
      }
    };
    const res = await fetch(`${BASE_URL}/api/portfolio-content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUpdate)
    });
    const data = await res.json();
    if (res.ok && data.success && data.content?.hero?.adminTestKey === 'test_value_123') {
      recordTest('Portfolio Content - Deep Merge Update', true, 'Deep merge update persisted successfully');
    } else {
      recordTest('Portfolio Content - Deep Merge Update', false, `Failed: ${JSON.stringify(data)}`);
    }

    // Clean up test key
    if (originalContent) {
      if (originalContent.hero) delete originalContent.hero.adminTestKey;
      await fetch(`${BASE_URL}/api/portfolio-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(originalContent)
      });
    }
  } catch (err) {
    recordTest('Portfolio Content - Deep Merge Update', false, 'Request failed', err);
  }

  // Test 11: MongoDB GridFS - Image Upload
  let uploadedImageId = null;
  try {
    // 1x1 transparent PNG as base64
    const tinyPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await fetch(`${BASE_URL}/api/portfolio-content/upload-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: tinyPngBase64,
        fileName: 'test_admin_spec.png'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.imagePath && data.fileId) {
      uploadedImageId = data.fileId;
      recordTest('GridFS Image Upload', true, `Uploaded to GridFS, ID: ${data.fileId}, Path: ${data.imagePath}`);
    } else {
      recordTest('GridFS Image Upload', false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('GridFS Image Upload', false, 'Request failed', err);
  }

  // Test 12: Stream Image back from GridFS
  if (uploadedImageId) {
    try {
      const res = await fetch(`${BASE_URL}/api/images/${uploadedImageId}`);
      if (res.ok && res.headers.get('content-type')?.includes('image')) {
        const buffer = await res.arrayBuffer();
        recordTest('GridFS Image Streaming', true, `Successfully fetched image (${buffer.byteLength} bytes, content-type: ${res.headers.get('content-type')})`);
      } else {
        recordTest('GridFS Image Streaming', false, `Failed with status ${res.status}`);
      }
    } catch (err) {
      recordTest('GridFS Image Streaming', false, 'Request failed', err);
    }

    // Clean up uploaded image
    try {
      const res = await fetch(`${BASE_URL}/api/images/${uploadedImageId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        recordTest('GridFS Image Deletion', true, `Deleted test image from GridFS (${uploadedImageId})`);
      } else {
        recordTest('GridFS Image Deletion', false, `Failed: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      recordTest('GridFS Image Deletion', false, 'Request failed', err);
    }
  }

  // Test 13: Resume PDF Upload
  try {
    // Minimal mock PDF Base64
    const samplePdfBase64 = 'data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iajw8L1BhZ2VzIDIgMCBSPj5lbmRvYmogMiAwIG9iajw8L0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvTWVkaWFCb3hbMCAwIDMgM10+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+Cg==';
    const res = await fetch(`${BASE_URL}/api/portfolio-content/upload-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: samplePdfBase64,
        fileName: 'test_admin_resume.pdf'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.resumePath) {
      recordTest('Resume Upload API', true, `Successfully saved resume to: ${data.resumePath}`);
    } else {
      recordTest('Resume Upload API', false, `Failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordTest('Resume Upload API', false, 'Request failed', err);
  }

  // Restore original profile image if changed by test
  if (originalContent?.about?.profileImage) {
    await fetch(`${BASE_URL}/api/portfolio-content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ about: { profileImage: originalContent.about.profileImage } })
    });
  }

  // Summary
  console.log('\n=============================================');
  console.log('--- TEST RESULTS SUMMARY ---');
  console.log('=============================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  return { total, passed, failed, results };
}

runTests();
