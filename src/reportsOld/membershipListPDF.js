import React from 'react';
import { Page, Text, Image, View, Document, StyleSheet } from '@react-pdf/renderer';
import styled from '@react-pdf/styled-components';
import { format } from 'date-fns';
import Logit from 'logit';
var logit = Logit('reports/membershipListPDF');
// var logit = (...args) => console.log(...args);
const home = process.env.HOME || process.env.HOMEPATH;
logit('home', home);
// Create styles
const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
const borderTop = {
  borderTopColor: '#808080',
  borderTopStyle: 'solid',
  borderTopWidth: 1,
  marginTop: 5,
  paddingTop: 5,
  marginRight: 3
};
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start'
  },
  header: {
    marginTop: 20,
    marginBottom: 0,
    marginLeft: 10,
    marginRight: 0,
    paddingRight: 10,

    margin: 10,
    padding: 0,
    flexDirection: 'column'
    // flexGrow: 1
  },
  boldHeader: {
    fontWeight: 'bold',
    fontSize: 14
    // textAlign: 'center'
  },
  normalHeader: {
    fontSize: 9
    // textAlign: 'right'
  },
  headerRow: { flexDirection: 'row', fontSize: 8, fontWeight: 'bold' }
});
const comp = {
  name: { textAlign: 'left', width: 85 },
  subs: { textAlign: 'center', width: 23 },
  address: { textAlign: 'left', width: 155 },
  phone: { textAlign: 'left', width: 63 },
  memNo: { textAlign: 'center', width: 23 },
  email: { textAlign: 'left', width: 154 },
  mobile: { textAlign: 'left', width: 65 },
  nextOfKin: { textAlign: 'left', width: 142 },
  medical: { textAlign: 'left', width: 75 }
};
function showSubs(mem) {
  const statusMap = { Member: '', HLM: 'hlm', Guest: 'gst', '?': '' };
  const subsMap = {
    OK: { color: 'green' },
    due: { color: 'orange', fontWeight: 'bold' },
    late: { color: 'red', fontWeight: 'bold' }
  };
  let stat = statusMap[mem.memberStatus || '?'];
  if (mem.memberId === 'M2031') logit('mem', mem, stat);
  if (stat !== '') return [stat, {}];

  // let subs = getSubsStatus(mem);
  let subs = mem.subsStatus;
  stat = `${mem.subscription ? "'" + (parseInt(mem.subscription) % 100) : '---'}`;
  let atts = subsMap[subs.status];
  if (mem.memberId === 'M2031') logit('subs', subs, stat, atts);
  return [stat, atts];
}

Object.values(comp).forEach(val => {
  val.paddingRight = 10;
  // val.paddingRight = 10;
});
const ColHeading = View;
// Create Document Component
export const MembershipListReport = ({ members }) => {
  logit('invoked', members.length, members);
  return (
    <Document
      title="St.Edward's Members"
      author="Booking System"
      subject="Membership List"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={[styles.headerRow, { justifyContent: 'space-between' }]}>
            <Image
              src={process.env.PUBLIC_URL + '/assets/steds-logo.jpg'}
              style={{ padding: 3 }}
            />
            <Text style={styles.boldHeader}>St.Edwards Fellwalkers: Membership List</Text>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.headerNormal}>{timestamp}</Text>
              <Text
                fixed
                style={styles.headerNormal}
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} of ${totalPages}`
                }
              />
            </View>
          </View>

          <ColHeading style={[styles.headerRow]} debug>
            <Text style={comp.name}>Name</Text>
            <Text style={comp.subs}>£</Text>
            <Text style={comp.address}>Address</Text>
            <Text style={comp.phone}>Phone</Text>
            <Text style={comp.memNo}>No</Text>
            <Text style={comp.email}>Email</Text>
            <Text style={comp.mobile}>Mobile</Text>
            <Text style={comp.nextOfKin}>Next of Kin</Text>
            <Text style={comp.medical}>Medical</Text>
          </ColHeading>
        </View>
        <View style={styles.section}>
          <View
            style={[
              {
                fontSize: 8,
                flexDirection: 'column',
                marginLeft: 10,
                marginRight: 0,
                paddingRight: 10
              }
            ]}
          >
            {members.map(mem => (
              <View
                key={mem._id}
                style={[{ flexDirection: 'row' }, borderTop]}
                wrap={false}
              >
                <Text style={comp.name}>{mem.fullNameR}</Text>
                <Text style={comp.subs}>{showSubs(mem)[0]}</Text>
                <Text style={comp.address}>{mem.address}</Text>
                <Text style={comp.phone}>{mem.phone}</Text>
                <Text style={comp.memNo}>{mem.memNo}</Text>
                <Text style={comp.email}>{mem.email}</Text>
                <Text style={comp.mobile}>{mem.mobile}</Text>
                <Text style={comp.nextOfKin}>{mem.nextOfKin}</Text>
                <Text style={comp.medical}>{mem.medical}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// let docname = '/Documents/My Documents/StEdwards/membersList.pdf';
