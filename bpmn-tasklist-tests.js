/* eslint-env mocha */
import { Bpmn } from 'meteor/cquencial:bpmn-engine';
import { assert } from 'meteor/practicalmeteor:chai';
import { Meteor } from 'meteor/meteor';
import camundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda';

const { EventEmitter } = require('events');

const processXml = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <startEvent id="theStart" />
    <task id="simpleTask" />
    <endEvent id="theEnd" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="simpleTask" />
    <sequenceFlow id="flow2" sourceRef="simpleTask" targetRef="theEnd" />
  </process>
</definitions>`;

const processWithUserTask = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="3Zskv8iNCGiL36hD7" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="sWq9Yk6KQxKxMkXAL" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1">
      <bpmn2:outgoing>SequenceFlow_1t1nkpj</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="SequenceFlow_1t1nkpj" sourceRef="StartEvent_1" targetRef="Task_0k617t9" />
    <bpmn2:endEvent id="EndEvent_04hio5w">
      <bpmn2:incoming>SequenceFlow_1pxyqh4</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="SequenceFlow_1pxyqh4" sourceRef="Task_0k617t9" targetRef="EndEvent_04hio5w" />
    <bpmn2:userTask id="Task_0k617t9" name="theUserTask" camunda:formKey="someForm" camunda:assignee="someAssignee" camunda:candidateUsers="someCandidate" camunda:candidateGroups="someCandidateGroups" camunda:dueDate="2015-06-26T09:54:00" camunda:followUpDate="2015-06-26T09:54:00" camunda:priority="high">
      <bpmn2:documentation>usertask documentation</bpmn2:documentation>
      <bpmn2:incoming>SequenceFlow_1t1nkpj</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_1pxyqh4</bpmn2:outgoing>
    </bpmn2:userTask>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="sWq9Yk6KQxKxMkXAL">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="275" y="174" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="248" y="210" width="90" height="20" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1t1nkpj_di" bpmnElement="SequenceFlow_1t1nkpj">
        <di:waypoint x="311" y="192" />
        <di:waypoint x="348" y="192" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="329.5" y="171" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="EndEvent_04hio5w_di" bpmnElement="EndEvent_04hio5w">
        <dc:Bounds x="464" y="174" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="482" y="214" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1pxyqh4_di" bpmnElement="SequenceFlow_1pxyqh4">
        <di:waypoint x="448" y="192" />
        <di:waypoint x="464" y="192" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="456" y="171" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="UserTask_0k7id09_di" bpmnElement="Task_0k617t9">
        <dc:Bounds x="348" y="152" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

const defaultState = {
  name: 'undefined',
  state: 'running',
  engineVersion: '4.2.0',
  definitions:
    [{
      id: 'anonymous',
      state: 'running',
      moddleContext: [{}],
      processes: [{}],
    }],
};

const Events = {
  start: 'start',
  enter: 'enter',
  end: 'end',
  wait: 'wait',
  leave: 'leave',
  taken: 'taken',
  cancel: 'cancel',
  error: 'error',
  discarded: 'discarded',
};

function mockUserTask() {
  return {
    id: Random.id(),
    name: 'theUserTask',
    assignee: 'someAssignee',
    candidateUsers: 'someCandidate',
    candidateGroups: 'someCandidateGroups',
    dueDate: '2015-06-26T09:54:00',
    followupDate: '2015-06-26T09:54:00',
    priority: 'high',
    documentation: 'usertask documentation',
  }
}

describe('bpmn-tasklist', function () {

  const isDefined = function (target, expectedType) {
    assert.isDefined(target);
    assert.equal(typeof target, expectedType, `expected ${expectedType} got ${typeof target}`);
  };

  const allKeysIn = (a, b) => {
    let is = true;
    Object.keys(a).forEach(key => {
      is = is && !!b[key];
    });
    return is;
  };

  const addUserTask = function (userTask) {

    const insertId = Bpmn.tasklist.add(instanceId, userTask);

    if (userTask.dueDate) {
      userTask.dueDate = new Date(userTask.dueDate);
    }
    if (userTask.followupDate) {
      userTask.followupDate = new Date(userTask.followupDate);
    }

    const byInsertId = Bpmn.tasklist.collection.findOne(insertId);
    assert.isTrue(allKeysIn( userTask, byInsertId));

    const byInstanceId = Bpmn.tasklist.collection.findOne({instanceId});
    assert.isTrue(allKeysIn(userTask, byInstanceId));
    assert.deepEqual(byInstanceId.instanceId, instanceId);

    return insertId;
  };

  let userId;
  let instanceId;

  beforeEach(() => {
    Bpmn.tasklist.on();
    Bpmn.tasklist.collection.remove({});
    userId = Random.id();
    instanceId = Random.id();
  });

  afterEach(() => {
    Bpmn.tasklist.off();
  });

  describe('Bpmn.tasklist.collection', function () {
    it('has a name', function () {
      isDefined(Bpmn.tasklist.collection.name, 'string');
    });

    it('has an optional schema definition', function () {
      isDefined(Bpmn.tasklist.collection.schema, 'object');
    });
  });

  describe('Bpmn.tasklist.add', function () {

    it('adds a userTask with full parameters', function () {
      const userTask = mockUserTask();
      addUserTask(userTask);
    });

    it('adds a userTask with minimal parameters', function () {
      const userTask = {
        id: 'Task_0k617t9',
        name: 'theUserTask',
      };
      addUserTask(userTask);
    });


    it('throws on wrong or missing parameters', function () {
      assert.throws(function () {
        addUserTask();
      });

      assert.throws(function () {
        addUserTask({});
      });

      assert.throws(function () {
        addUserTask({id:'', name:''});
      })
    });
  });
  describe('Bpmn.tasklist.remove', function () {
    it('removes all tasks by a given instanceId', function () {
      const userTask = mockUserTask();
      addUserTask(instanceId, userTask);
      addUserTask(instanceId, userTask);
      assert.isTrue(Bpmn.tasklist.collection.findOne({instanceId}))
      const removed = Bpmn.tasklist.remove({instanceId});
      assert.equal(removed, 2);
      assert.isFalse(Bpmn.tasklist.collection.findOne({instanceId}))
    });

    it('removes a tasks by a given instanceId and taskId', function () {
      const userTask = mockUserTask();
      addUserTask(instanceId, userTask);
      addUserTask(instanceId, userTask);
      assert.isTrue(Bpmn.tasklist.collection.findOne({instanceId}))
      const removed = Bpmn.tasklist.remove({instanceId});
      assert.equal(removed, 2);
      assert.isFalse(Bpmn.tasklist.collection.findOne({instanceId}))
    });

    it('throws missing parameters', function () {
      assert.throws(function () {
        Bpmn.tasklist.remove({});
      });
      assert.throws(function () {
        Bpmn.tasklist.remove({id: Random.id()});
      })
      assert.throws(function () {
        Bpmn.tasklist.remove({name:"some name"});
      })
    });
  });

  describe('Engine.execute', function () {
    it('has an added a userTask when wating state has been entered', function (done) {
      assert.equal(Bpmn.tasklist.collection.find().count(), 0);

      const engine = new Bpmn.Engine({
        source: processWithUserTask,
        moddleOptions: {
          camunda: camundaBpmnModdle
        }
      });
      const tasklistListener = new EventEmitter();
      tasklistListener.on('wait', Meteor.bindEnvironment((element)=>{
        const {instanceId} = engine;
        assert.equal(Bpmn.tasklist.collection.find().count(), 1);
        const userTask = Bpmn.tasklist.collection.findOne({instanceId});
        assert.isDefined(userTask.id)
        assert.equal(userTask.type, 'bpmn:userTask');
        assert.equal(userTask.name, 'theUserTask');
        assert.equal(userTask.formKey, 'someForm');
        assert.equal(userTask.assignee, 'someAssignee');
        assert.equal(userTask.candidateUsers, 'someCandidate');
        assert.equal(userTask.candidateGroups, 'someCandidateGroups');
        assert.equal(userTask.dueDate, '2015-06-26T09:54:00');
        assert.equal(userTask.followUpDate, '2015-06-26T09:54:00');
        assert.equal(userTask.priority, 'high');
        assert.equal(userTask.documentation, 'usertask documentation');
        done();
      }));

      engine.execute({
        listener: tasklistListener
      })
    });

    it('removes al instances userTasks on natural process end', function (done) {
      assert.fail();
    });
  });

  describe('Engine.stop', function () {
    it('removes al instances userTasks on stop', function (done) {
      assert.fail();
    });
  });

  describe('Engine.resume', function () {
    it('resume the task list on resume that has been before stop', function (done) {
      assert.fail();
    });

    it('removes al instances userTasks on natural process end', function (done) {
      assert.fail();
    });
  });
});
